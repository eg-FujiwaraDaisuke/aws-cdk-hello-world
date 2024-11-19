import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as apiGateWay from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Context } from "../../context";

export class ApiGateWayStack extends cdk.Stack {
  constructor(scope: Construct, context: Context) {
    const { stage } = context;
    const id = `${stage}-ApiStack`;
    super(scope, id);
    // Lambda layer
    const lambdaLayer = new lambda.LayerVersion(this, `${stage}-NestApplambdaLayer`, {
      code: lambda.Code.fromAsset("src/api/node_modules"),
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_20_X,
      ],
    });

    // Lambda
    const appLambda = new lambda.Function(this, `${stage}-NestApplambda`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("src/api/dist"),
      handler: "main.handler",
      layers: [lambdaLayer],
      environment: {
        NODE_PATH: "$NODE_PATH:/opt",
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        STAGE: stage,
      },
      timeout: Duration.seconds(30),
    });
    // API Gateway
    const restApi = new apiGateWay.RestApi(this, `${stage}-NestAppApiGateway`, {
      restApiName: `${stage}-NestAppApiGw`,
      deployOptions: {
        stageName: `api/${stage}`,
        dataTraceEnabled: true,
        loggingLevel: apiGateWay.MethodLoggingLevel.INFO,
      },
      // CORS設定
      defaultCorsPreflightOptions: {
        // warn: 要件に合わせ適切なパラメータに絞る
        allowOrigins: apiGateWay.Cors.ALL_ORIGINS,
        allowMethods: apiGateWay.Cors.ALL_METHODS,
        allowHeaders: apiGateWay.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
    });

    restApi.root.addProxy({
      defaultIntegration: new apiGateWay.LambdaIntegration(appLambda),
      anyMethod: true
    });
  }
}
