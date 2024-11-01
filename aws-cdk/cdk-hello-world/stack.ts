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
    }
}
