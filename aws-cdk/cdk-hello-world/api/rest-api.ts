import { Construct } from 'constructs';
import { Context } from '../../context';
import { APIOption, METHOD_OPTIONS } from './interface';
import * as apiGateWay from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { PreconfiguredLambdaFunction } from '../../utils/constructs/lambda';

export class RestApi extends apiGateWay.RestApi {
    public constructor(scope: Construct, context: Context, option: APIOption) {
        const { stage, stackType } = context;

        // RestAPI設定
        const restApiName = `fujiwara_3111_${stackType}_${stage}`;

        // URLが変わらないようにcisの場合は従来通りの名前にする(負の遺産)
        const restApi = `RestApi_${stackType}`;
        super(scope, restApi, {
            cloudWatchRole: true,
            defaultMethodOptions: METHOD_OPTIONS,
            deployOptions: {
                stageName: stage,
                dataTraceEnabled: true,
                loggingLevel: apiGateWay.MethodLoggingLevel.INFO,
            },
            binaryMediaTypes: ['application/octet-stream', 'multipart/form-data'],
            description: `API Gateway for ${restApiName}`,
            restApiName,
            // CORSの設定
            defaultCorsPreflightOptions: {
                allowOrigins: apiGateWay.Cors.ALL_ORIGINS,
                allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allowHeaders: [
                    'Content-Type',
                    'x-api-key',
                    'Access-Control-Allow-Headers',
                    'access-control-allow-origin',
                    'Authorization',
                ],
                statusCode: 200,
            },
        });

        new s3.Bucket(this, 'files', {
            accessControl: BucketAccessControl.PUBLIC_READ,
            publicReadAccess: true,
        });

        // エンドポイント登録
        const authorizer = this.authorizer(scope, context, option);
        this.setRestAPI(context, option, authorizer);
    }

    /**
     * Rest APIの設定
     * @param context           コンテキスト
     * @param option            API作成時のオプション
     * @returns Rest API
     */
    private setRestAPI(
        context: Context,
        option: APIOption,
        authorizer?: apiGateWay.IAuthorizer
    ): void {
        const { name } = option;
        const { stackType } = context;
        const rootPath = this.rootPath(option.rootPath);
        const fn = new PreconfiguredLambdaFunction(this, {
            context,
            name: name,
            props: {
                // lambda関数に登録する際に使用するコードまでのディレクトリ
                code: lambda.Code.fromAsset(
                    path.join(
                        context.config.distDir,
                        `lambda-handlers/${rootPath}s/${stackType}/${name}`
                    )
                ),
                timeout: Duration.minutes(15),
            },
            timeoutDuration: 14 * 60,
        });

        // ポリシー付与
        for (const statement of option?.statements ?? []) {
            fn.addToRolePolicy(statement);
        }

        // 環境変数付与
        for (const env of option?.environments ?? []) {
            fn.addEnvironment(env.key, env.value, env.options);
        }

        // lambda関数をAPI Gatewayメソッドに統合
        fn.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
        const integration = new apiGateWay.LambdaIntegration(fn, {
            passthroughBehavior: apiGateWay.PassthroughBehavior.WHEN_NO_TEMPLATES,
            proxy: true,
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Timestamp': 'integration.response.header.Date',
                        'method.response.header.Content-Length':
                            'integration.response.header.Content-Length',
                        'method.response.header.Content-Type':
                            'integration.response.header.Content-Type',
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,Authorization'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,POST,PUT,GET,DELETE'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                },
                {
                    statusCode: '400',
                    selectionPattern: '4\\d{2}',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,Authorization'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,POST,PUT,GET,DELETE'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                },
                {
                    statusCode: '500',
                    selectionPattern: '5\\d{2}',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,Authorization'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,POST,PUT,GET,DELETE'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                },
            ],
        });

        // 受付可能なメソッドの設定
        // {rootPath}/v1/メソッド名の形式で設定
        const apiResource = this.root.getResource(rootPath) ?? this.root.addResource(rootPath);
        const stackResource =
            apiResource.getResource(`${stackType}`) ?? apiResource.addResource(`${stackType}`);
        const resource = stackResource.getResource(name) ?? stackResource.addResource(name);

        // ANYメソッドの受付設定(x-api-key認証を有効化)
        const methodOptions = this.createMethodOptions(option, authorizer);
        resource.addMethod('ANY', integration, methodOptions);
        const proxy = resource.addProxy({
            defaultIntegration: integration,
            anyMethod: false,
        });
        proxy.addMethod('ANY', undefined, methodOptions);

        if (option.name === 'power-plant-groups') {
            fn.addToRolePolicy(
                new iam.PolicyStatement({
                    resources: ['*'],
                    actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
                })
            );
        }
    }

    /**
     * 関数作成時のオプションを作成(認証必須にするか否かによってオプションを変更)
     * @param option            API作成時のオプション
     * @param authorizer        cognito認証情報
     * @returns MethodOptions
     */
    private createMethodOptions(
        option: APIOption,
        authorizer?: apiGateWay.IAuthorizer
    ): apiGateWay.MethodOptions {
        const methodResponses: apiGateWay.MethodResponse[] = [
            {
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Timestamp': true,
                    'method.response.header.Content-Length': true,
                    'method.response.header.Content-Type': true,
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true,
                },
            },
            {
                statusCode: '400',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true,
                },
            },
            {
                statusCode: '500',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true,
                },
            },
        ];

        // 関数オプションのベース
        const useApiKey = option.useApiKey ?? true;
        const methodOptionsBase = {
            apiKeyRequired: useApiKey,
            methodResponses,
        };

        // cognito認証スキップ指定がある場合は認証オプションを含めない
        if (option.isSkipAuth === true) {
            return methodOptionsBase;
        }

        // 認証オプションを追加
        const methodOptionsWithAuth = {
            ...methodOptionsBase,
            authorizationType: apiGateWay.AuthorizationType.COGNITO,
            authorizer,
        };
        return methodOptionsWithAuth;
    }

    private authorizer(
        scope: Construct,
        context: Context,
        option: APIOption
    ): apiGateWay.IAuthorizer | undefined {
        const useAuthorizer = option.isSkipAuth === undefined;
        if (!useAuthorizer) {
            return undefined;
        }

        const userPool = cognito.UserPool.fromUserPoolId(
            scope,
            'UserPool',
            context.config.userPoolId(context.stage)
        );

        const authorizer = new apiGateWay.CognitoUserPoolsAuthorizer(scope, 'Authorizer', {
            cognitoUserPools: [userPool],
        });
        return authorizer;
    }

    private rootPath(rootPath: string | undefined): string {
        return rootPath ?? 'api';
    }
}
