import { Construct } from 'constructs';
import * as apiGateWay from 'aws-cdk-lib/aws-apigateway';
import { Context } from '../../context';

export class APIConstruct extends Construct {
    public constructor(scope: Construct, context: Context, api: apiGateWay.RestApi) {
        const constructId = 'API';
        super(scope, constructId);
        const { stage } = context;

        // APIキーの設定
        this.setAPIKey(api, stage);
    }

    /**
     * APIキーの設定
     * @param api               対象のRestAPI
     * @param stage             対象ステージ(devやprd等)
     * @returns なし
     */
    private setAPIKey(api: apiGateWay.RestApi, stage: string): void {
        const deployment = api.latestDeployment;
        if (!deployment) {
            return;
        }

        // APIキーの設定
        const name = `${stage}`;
        const apiGateWayStage = new apiGateWay.Stage(this, name, {
            variables: { provider: 'fujiwara' },
            stageName: name,
            deployment: deployment,
            dataTraceEnabled: true,
            loggingLevel: apiGateWay.MethodLoggingLevel.INFO,
        });

        // APIキーを作成
        const apiKey = new apiGateWay.ApiKey(this, `ApiKey-${name}`, { apiKeyName: name });
        const plan = api.addUsagePlan(`UsagePlan-${name}`, { name });
        plan.addApiKey(apiKey);
        plan.addApiStage({ stage: apiGateWayStage });
    }
}
