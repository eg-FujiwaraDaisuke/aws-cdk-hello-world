#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkHelloWorldStack } from '../aws-cdk/cdk-hello-world-stack';

const app = new cdk.App();
new CdkHelloWorldStack(app);
