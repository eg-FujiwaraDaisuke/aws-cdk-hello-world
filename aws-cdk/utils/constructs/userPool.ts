import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
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

    // Cognito Identity PoolとCognito User Poolの関連付け
    new cognito.CfnIdentityPoolRoleAttachment(scope, `${stackId}-identityPoolRoleAttachment`, {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: '',
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
