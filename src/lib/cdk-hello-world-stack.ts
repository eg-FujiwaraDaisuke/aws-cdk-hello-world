import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkHelloWorldStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

        const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
          runtime: lambda.Runtime.NODEJS_20_X,
          code: lambda.Code.fromAsset('lambda'),
          handler: 'hello.handler',
        });

        const api = new apigateway.LambdaRestApi(this, 'HelloWorldApi', {
          handler: helloWorldFunction,
          proxy: false,
        });

        const helloResource = api.root.addResource('hello');
        helloResource.addMethod('GET');
    }
  }
