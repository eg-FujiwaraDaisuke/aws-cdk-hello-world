import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Context } from '../context';
import { Config } from '../config';
import { HelloApi } from './api/hello';
import { EnvironmentUserPool } from '../utils/constructs/userPool';

export class CdkHelloWorldStack extends cdk.Stack {
    constructor(scope: Construct) {
        const account: string = scope.node.tryGetContext('account');
        const region: string = scope.node.tryGetContext('region');
        const env = { account, region };
        
        const stage: string = scope.node.tryGetContext('stage');
        const stackType = 'cdkHelloWorld';
        const stackId = `${stage}-${stackType}`;
        super(scope, stackId, { env });

        new EnvironmentUserPool(this, stackId)

        const context: Context = {
            stage,
            config: new Config(),
            stackType: stackType,
            scope: this,
            prefix: stackId,
        };

        new HelloApi(this, context);

        // // 以下ユーザープールの作成
        // // 環境ごとのユーザープール名を取得
        // const userPoolName = `${stage}-UserPool`;

        // // ユーザープールの作成
        // const userPool = new cognito.UserPool(this, `${stage}-UserPool`, {
        //   userPoolName: userPoolName,
        //   signInAliases: {
        //     email: true,
        //   },
        //   autoVerify: {
        //     email: true,
        //   },
        //   passwordPolicy: {
        //     minLength: 8,
        //     requireSymbols: true,
        //     requireUppercase: true,
        //     requireLowercase: true,
        //     requireDigits: true,
        //   },
        // });

        // // ユーザープールクライアントの作成
        // const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
        //   userPool,
        //   authFlows: {
        //     userPassword: true,
        //   },
        // });

        // // 出力情報
        // new cdk.CfnOutput(this, 'UserPoolId', {
        //   value: userPool.userPoolId,
        //   description: 'The ID of the user pool',
        // });

        // new cdk.CfnOutput(this, 'UserPoolClientId', {
        //   value: userPoolClient.userPoolClientId,
        //   description: 'The client ID of the user pool client',
        // });
    }
}
