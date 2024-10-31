import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class EnvironmentUserPool extends cognito.UserPool {
    public userPoolClient: cognito.UserPoolClient;

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

        // ユーザープールクライアントの作成
        this.userPoolClient = new cognito.UserPoolClient(scope, `${stackId}-UserPoolClient`, {
            userPool: this,
            authFlows: {
                userPassword: true,
            },
        });
    }
}
