import { Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { Context } from "../../context";
import { ApiGateWay } from "../../utils/constructs/apiGateWay";
import { LambdaFunction } from "../../utils/constructs/lambda";

export class HelloApi extends Construct {
  public constructor(scope: Construct, context: Context, apiGateWay: ApiGateWay) {
    const constructId = "HelloApi";
    super(scope, constructId);
    const { stackType } = context;

    const apiName = "hello";
    const apiPath = "api";

    new LambdaFunction(this, {
      context,
      lambdaName: apiName,
      props: {
        // lambda関数に登録する際に使用するコードまでのディレクトリ
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

    // エンドポイントとメソッドを設定
    // エンドポイント　api/${stackType}/${apiName}
    const apiResource =
    apiGateWay.root.getResource(apiPath) ?? apiGateWay.root.addResource(apiPath);
    const stackResource =
      apiResource.getResource(`${stackType}`) ??
      apiResource.addResource(`${stackType}`);
    const resource =
      stackResource.getResource(apiName) ?? stackResource.addResource(apiName);
    resource.addMethod("GET");
  }
}
