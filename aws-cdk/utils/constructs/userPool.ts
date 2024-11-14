import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam"; // IAM モジュールをインポート
import { Construct } from "constructs";

export class EnvironmentUserPool extends cognito.UserPool {
  constructor(scope: Construct, stackId: string) {
    const userPoolName = `${stackId}-userPool`;

    // UserPoolのコンストラクタを呼び出す
    super(scope, userPoolName, {
      userPoolName: userPoolName,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: true,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
      },
    });

    const userPoolClientId = `${stackId}-UserPoolClient`;

    // ユーザープールクライアントの作成
    const userPoolClient = new cognito.UserPoolClient(scope, userPoolClientId, {
      userPool: this,
      authFlows: {
        userPassword: true,
      },
    });

    // Identity Poolの作成
    const identityPoolId = `${stackId}-identityPool`;
    const identityPool = new cognito.CfnIdentityPool(scope, identityPoolId, {
      identityPoolName: identityPoolId,
      allowUnauthenticatedIdentities: false,
    });

    // 環境ごとの IAM ロールを作成
    const authenticatedRole = new iam.Role(scope, `${stackId}-AuthenticatedRole`, {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          ForAnyValueEquals: {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    const lambdaAccessPolicy = new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [`arn:aws:lambda:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:function:${stackId}-*`], // 環境ごとの Lambda 関数にアクセス
    });

    // IAM ロールにポリシーを追加
    authenticatedRole.addToPolicy(lambdaAccessPolicy);

    // Cognito Identity PoolとCognito User Poolの関連付け
    new cognito.CfnIdentityPoolRoleAttachment(scope, `${stackId}-identityPoolRoleAttachment`, {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn, // IAM ロールの ARN を指定
      },
    });

    // 出力情報
    new cdk.CfnOutput(this, "UserPoolIdOutput", {
      value: this.userPoolId,
      description: `The ID of the ${stackId} user pool`,
    });

    new cdk.CfnOutput(this, "UserPoolClientIdOutput", {
      value: userPoolClient.userPoolClientId,
      description: `The client ID of the ${stackId} user pool client`,
    });

    new cdk.CfnOutput(this, "IdentityPoolIdOutput", {
      value: identityPool.ref,
      description: `The ID of the ${stackId} identity pool`,
    });
  }
}
