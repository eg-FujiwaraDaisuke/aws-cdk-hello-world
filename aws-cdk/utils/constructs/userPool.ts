import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class EnvironmentUserPool extends cognito.UserPool {
  constructor(scope: Construct, stackId: string) {
    const userPoolName = `${stackId}-userPool`;

    // UserPoolのコンストラクタを呼び出す
    super(scope, userPoolName, {
      userPoolName: userPoolName,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: true,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
      },
    });

    // UserPoolClientの作成
    const userPoolClient = new cognito.UserPoolClient(scope, `${stackId}-UserPoolClient`, {
      userPool: this,
      authFlows: {
        userPassword: true,
        userSrp: true,  // SRP 認証を有効にする
      },
    });

    // Identity Poolの作成
    const identityPool = new cognito.CfnIdentityPool(scope, `${stackId}-IdentityPool`, {
      identityPoolName: `${stackId}-identityPool`,
      allowUnauthenticatedIdentities: false,
    });

    // IAM ロールの作成
    const authenticatedRole = new iam.Role(scope, `${stackId}-AuthenticatedRole`, {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          "StringEquals": {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    // Lambda アクセス用のポリシー
    authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [
          `arn:aws:lambda:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:function:${stackId}-*`,
        ],
      })
    );

    // Identity PoolとIAMロールの関連付け
    new cognito.CfnIdentityPoolRoleAttachment(scope, `${stackId}-IdentityPoolRoleAttachment`, {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    });

    // 出力の作成
    new cdk.CfnOutput(scope, `${stackId}-UserPoolId`, {
      value: this.userPoolId,
      description: `The ID of the ${stackId} User Pool`,
    });

    new cdk.CfnOutput(scope, `${stackId}-UserPoolClientId`, {
      value: userPoolClient.userPoolClientId,
      description: `The Client ID of the ${stackId} User Pool Client`,
    });

    new cdk.CfnOutput(scope, `${stackId}-IdentityPoolId`, {
      value: identityPool.ref,
      description: `The ID of the ${stackId} Identity Pool`,
    });
  }
}
