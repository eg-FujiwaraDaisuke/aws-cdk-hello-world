import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
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
        const stackType = 'stf03111-cdkHelloWorld';
        const stackId = `${stackType}-${stage}`;
        super(scope, stackId, { env });

        const userPool = new EnvironmentUserPool(this, stackId)

        const config = new Config(userPool.userPoolId);
        const context: Context = {
            stage,
            config,
            stackType,
            scope: this,
            prefix: stackId,
        };

        new HelloApi(this, context);
    }
}
