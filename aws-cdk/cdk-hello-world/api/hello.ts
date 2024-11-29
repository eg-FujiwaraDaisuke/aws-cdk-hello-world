import { Duration } from "aws-cdk-lib";
import * as apiGateWay from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { Context } from "../../context";
import { ApiGateWay } from "../../utils/constructs/apiGateWay";
import { LambdaFunction } from "../../utils/constructs/lambda";

export class HelloApi extends Construct {
  public constructor(scope: Construct, context: Context, apiGateway: ApiGateWay) {
    const constructId = "HelloApi";
    super(scope, constructId);
    const { stackType } = context;

    const apiName = "hello";
    const apiPath = "api";

    // Lambda関数のインスタンスを作成
    const helloWorldFunction = new LambdaFunction(this, {
      context,
      lambdaName: apiName,
      props: {
        // Lambda関数に登録する際に使用するコードまでのディレクトリ
        code: lambda.Code.fromAsset(
          path.join(
            context.config.distDir,
            `lambda-handler/${apiPath}s/${stackType}/${apiName}`,
          ),
        ),
        timeout: Duration.minutes(15),
      },
      timeoutDuration: 14 * 60,
    });

    // api/${stackType}/apiNameをエンドポイントとする
    const apiResource =
      apiGateway.root.getResource(apiPath) ?? apiGateway.root.addResource(apiPath);
    const stackResource =
      apiResource.getResource(`${stackType}`) ?? apiResource.addResource(`${stackType}`);
    const resource =
      stackResource.getResource(apiName) ?? stackResource.addResource(apiName);

    const authorizer = apiGateway.authorizer;

    // Lambda統合の設定
    const integration = new apiGateWay.LambdaIntegration(helloWorldFunction, {
      proxy: true,
    });

    // HTTPメソッドの追加
    resource.addMethod("GET", integration, {
      authorizer: authorizer,
      authorizationType: apiGateWay.AuthorizationType.COGNITO,
    });
  }
}
