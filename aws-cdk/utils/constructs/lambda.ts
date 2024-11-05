import { Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { merge } from "lodash";
import { Context } from "../../context";

interface LambdaFunctionParams {
  readonly lambdaName: string;
  readonly context: Context;
  readonly props: Omit<
    lambda.FunctionProps,
    "runtime" | "functionName" | "handler"
  >;
  /** タイムアウトのアラームを発行するまでの時間(秒) */
  readonly timeoutDuration: number;
}

export class LambdaFunction extends lambda.Function {
  public constructor(scope: Construct, params: LambdaFunctionParams) {
    const { stage } = params.context;

    const functionName = `${stage}_${params.lambdaName}`;

    const defaultFunctionParams: Omit<lambda.FunctionProps, "code"> = {
      functionName: functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      memorySize: 512,
      timeout: Duration.minutes(1),
      tracing: lambda.Tracing.ACTIVE,
      allowPublicSubnet: true,
      environment: {
        MINDEN_DEPLOY_ENV: stage,
      },
    };

    super(scope, functionName, merge(defaultFunctionParams, params.props));
  }
}
