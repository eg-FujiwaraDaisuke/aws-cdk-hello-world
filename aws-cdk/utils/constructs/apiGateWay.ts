import * as apiGateWay from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Context } from '../../context';

const METHOD_OPTIONS = {
    // apiKeyは不要
    apiKeyRequired: false,
    methodResponses: [
        { statusCode: '200' }, // OK
        { statusCode: '400' }, // Bad Request
        { statusCode: '401' }, // Unauthorized
        { statusCode: '403' }, // Forbidden
        { statusCode: '404' }, // Not Found
        { statusCode: '500' }, // Internal Server Error
        { statusCode: '503' }, // Service Unavailable
    ],
};

export class ApiGateWay extends apiGateWay.RestApi {
    public constructor(scope: Construct, context: Context) {
        const { stage, prefix } = context;

        const ApiGateWayId = `${prefix}-ApiGateWay`;
        super(scope, ApiGateWayId, {
            // CloudWatch Logs にログを送信するための IAM ロールを作成する
            cloudWatchRole: true,
            defaultMethodOptions: METHOD_OPTIONS,
            // stage別にApiGateWayを作成
            deployOptions: {
                stageName: stage,
                dataTraceEnabled: true,
                loggingLevel: apiGateWay.MethodLoggingLevel.INFO,
            },
            // HTML フォームからデータを受信可能
            binaryMediaTypes: ['application/octet-stream', 'multipart/form-data'],
            description: `API Gateway for ${prefix}`,
            restApiName: ApiGateWayId,
            // CORSの設定
            defaultCorsPreflightOptions: {
                // 全てのオリジンからリクエストを許可
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

        this.setUserPoolAuthorizer(scope, context);
    }

    /**
     * Cognito ユーザープールオーソライザーを設定
     * @param scope           スコープ
     * @param context         コンテキスト
     */
    private setUserPoolAuthorizer(
        scope: Construct,
        context: Context,
    ): void {
        // userPoolIDのユーザプールを参照する
        const userPool = cognito.UserPool.fromUserPoolId(
            scope,
            'UserPool',
            context.config.userPoolId
        );

        new apiGateWay.CognitoUserPoolsAuthorizer(scope, 'Authorizer', {
            cognitoUserPools: [userPool],
        });
    }
}
