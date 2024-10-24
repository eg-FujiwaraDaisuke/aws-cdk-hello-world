import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration, Stack } from 'aws-cdk-lib';
import { Context } from '../../context';
import { Construct } from 'constructs';
import { Config } from '../../config';
import { merge } from 'lodash';
import * as path from 'path';

interface PreconfiguredLambdaFunctionParams {
    readonly name: string;
    readonly context: Context;
    readonly props: Omit<lambda.FunctionProps, 'runtime' | 'functionName' | 'handler'>;
    /** タイムアウトのアラームを発行するまでの時間(秒) */
    readonly timeoutDuration: number;
}

interface AddNodeMobulesLayerParams {
    readonly stage: string;
    readonly config: Config;
    readonly scope: Construct;
}

export class PreconfiguredLambdaFunction extends lambda.Function {

    public constructor(scope: Construct, params: PreconfiguredLambdaFunctionParams) {
        const { stage } = params.context;

        const functionName = `${stage}_${params.name}`;

        const defaultFunctionParams: Omit<lambda.FunctionProps, 'code'> = {
            functionName: functionName,
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            memorySize: 512,
            timeout: Duration.minutes(1),
            tracing: lambda.Tracing.ACTIVE,
            allowPublicSubnet: true,
            environment: {
                MINDEN_DEPLOY_ENV: stage,
            },
        };

        super(scope, functionName, merge(defaultFunctionParams, params.props));

        this.addSSMGetParameterPolicy(stage);
        this.addNodeModulesLayer({ stage, config: params.context.config, scope });
    }

    private addSSMGetParameterPolicy(stage: string): void {
        const { region, account } = Stack.of(this);
        this.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [`arn:aws:ssm:${region}:${account}:parameter/${stage}/*`],
                actions: ['ssm:GetParameter'],
            })
        );
    }

    private addNodeModulesLayer({ config, scope }: AddNodeMobulesLayerParams): void {
        const { stackName, node } = Stack.of(this);
        const layerVersionName = `${stackName}_PreconfiguredLambdaFunction_NodeModules_Layer`;
        const layerPath = path.join(config.distDir, 'layer');
        const layer =
            (node
                .findAll()
                .find(({ node }) => node.id === layerVersionName) as lambda.LayerVersion) ??
            new lambda.LayerVersion(scope, layerVersionName, {
                layerVersionName,
                code: lambda.Code.fromAsset(layerPath),
                compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            });
        this.addLayers(layer);
    }
}
