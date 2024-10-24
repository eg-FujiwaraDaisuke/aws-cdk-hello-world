import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Context } from '../../context';
import * as iam from 'aws-cdk-lib/aws-iam'
import { APIOption, EnvironmentVariable } from './interface';
import { RestApi } from './rest-api';
import { APIConstruct } from './apiconstract';
import { HelloApi } from './hello';

export class CreateCdkHelloWorldApi extends Stack {
    private context: Context;

    public constructor(scope: Construct, context: Context) {
        super(scope, 'CreateCdkHelloWorldApi');
        this.context = context;

        // const apiOptions: APIOption[] = [
        //     { name: 'customers' },
        //     {
        //         name: 'payment-notifications',
        //         statements: this.buildPaymentNotificationsStatements(),
        //         environments: this.buildPaymentNotificationEnvironments(),
        //     },
        // ];
        // const api = new RestApi(scope, context, apiOptions);
        // new APIConstruct(scope, context, api);
        // new HelloApi(scope, context)
    }

    private buildPaymentNotificationsStatements(): iam.PolicyStatement[] {
        const { region, account } = Stack.of(this);
        return [
            new iam.PolicyStatement({
                resources: ['*'],
                actions: ['s3:PutObject'],
            }),
            new iam.PolicyStatement({
                // 応援料金計算Lambdaの実行権限を付与
                resources: [
                    `arn:aws:lambda:${region}:${account}:function:${this.context.stage}_CalculationSupportAmount`,
                ],
                actions: ['lambda:InvokeFunction'],
            }),
            new iam.PolicyStatement({
                // 支払、約定通知出力Excel&Zip作成Lambdaの実行権限付与
                resources: [
                    `arn:aws:states:${region}:${account}:stateMachine:${this.context.stage}-purchase-cis-CreateExcelAndZip-StateMachine-for-CreateExcelAndZip`,
                    `arn:aws:states:${region}:${account}:stateMachine:${this.context.stage}-purchase-cis-CreateMatchedExcelAndZip-StateMachine-for-CreateExcelAndZip`,
                ],
                actions: ['states:StartExecution'],
            }),
        ];
    }

    private buildPaymentNotificationEnvironments(): EnvironmentVariable[] {
        const { account } = Stack.of(this);

        const createExcelAndZipSFNArn: EnvironmentVariable = {
            key: 'CREATE_EXCEL_AND_ZIP_SFN_ARN',
            value: `arn:aws:states:ap-northeast-1:${account}:stateMachine:${this.context.stage}-purchase-cis-CreateExcelAndZip-StateMachine-for-CreateExcelAndZip`,
        };

        const createMatchedExcelAndZipSFNArn: EnvironmentVariable = {
            key: 'CREATE_MATCHED_EXCEL_AND_ZIP_SFN_ARN',
            value: `arn:aws:states:ap-northeast-1:${account}:stateMachine:${this.context.stage}-purchase-cis-CreateMatchedExcelAndZip-StateMachine-for-CreateExcelAndZip`,
        };

        return [createExcelAndZipSFNArn, createMatchedExcelAndZipSFNArn];
    }
  }
