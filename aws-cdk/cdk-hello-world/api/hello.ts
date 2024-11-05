import { Duration } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { Context } from "../../context";
import { LambdaFunction } from "../../utils/constructs/lambda";

export class HelloApi extends Construct {
  public constructor(scope: Construct, context: Context) {
    const constructId = "HelloApi";
    super(scope, constructId);
    const { stackType } = context;

    const apiName = "hello";
    const apiPath = "api";

    const helloWorldFunction = new LambdaFunction(this, {
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

    const api = new apigateway.LambdaRestApi(this, "HelloWorldApi", {
      handler: helloWorldFunction,
      proxy: false,
    });

    // エンドポイントとメソッドを設定
    // エンドポイント　api/${stackType}/${apiName}
    const apiResource =
      api.root.getResource(apiPath) ?? api.root.addResource(apiPath);
    const stackResource =
      apiResource.getResource(`${stackType}`) ??
      apiResource.addResource(`${stackType}`);
    const resource =
      stackResource.getResource(apiName) ?? stackResource.addResource(apiName);
    resource.addMethod("GET");
  }
}
