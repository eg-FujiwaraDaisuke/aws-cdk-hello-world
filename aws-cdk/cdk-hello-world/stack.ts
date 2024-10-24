import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Context } from '../context';
import { Config } from '../config';
import { CreateCdkHelloWorldApi } from './api';

export class CdkHelloWorldStack extends cdk.Stack {
    constructor(scope: Construct) {
        const account: string = scope.node.tryGetContext('account');
        const region: string = scope.node.tryGetContext('region');
        const env = { account, region };
        
        const stage: string = scope.node.tryGetContext('stage');
        const stackType = 'cdk-hello-world';
        const id = `${stage}-${stackType}`;
        super(scope, id, { env });

        const context: Context = {
            stage,
            config: new Config(),
            stackType: stackType,
            scope: this,
            prefix: id,
        };

        new CreateCdkHelloWorldApi(this, context);

        const distDir = context.config.distDir;

        const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          code: lambda.Code.fromAsset(
            path.join(
              distDir,
                'lambda'
            )
        ),
          handler: 'hello.handler',
        });

        const api = new apigateway.LambdaRestApi(this, 'HelloWorldApi', {
          handler: helloWorldFunction,
          proxy: false,
        });

        const helloResource = api.root.addResource('hello');
        helloResource.addMethod('GET');

        // 以下ユーザープールの作成
        // 環境ごとのユーザープール名を取得
        const userPoolName = `${stage}-UserPool`;

        // ユーザープールの作成
        const userPool = new cognito.UserPool(this, `${stage}-UserPool`, {
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

        // ユーザープールクライアントの作成
        const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
          userPool,
          authFlows: {
            userPassword: true,
          },
        });

        // 出力情報
        new cdk.CfnOutput(this, 'UserPoolId', {
          value: userPool.userPoolId,
          description: 'The ID of the user pool',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
          value: userPoolClient.userPoolClientId,
          description: 'The client ID of the user pool client',
        });
    }
  }
