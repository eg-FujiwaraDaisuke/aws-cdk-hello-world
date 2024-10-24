import * as iam from 'aws-cdk-lib/aws-iam'
// import * as lambda from 'aws-lambda';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Context } from '../../context';

export interface APIOption {
    name: string;
    isSkipAuth?: boolean;
    rootPath?: string;
    useApiKey?: boolean;
    statements?: iam.PolicyStatement[];
    environments?: EnvironmentVariable[];
}

export interface EnvironmentVariable {
    key: string;
    value: string;
    options?: lambda.EnvironmentOptions | undefined;
}

/**
 * リクエスト
 */
// export interface Request {
//     event: lambda.APIGatewayProxyEvent;
//     context: lambda.APIGatewayEventRequestContext;
// }

interface Api {
    (context: Context, req: Request, res: Response): Promise<void>;
}

export interface Options {
    readonly role: iam.IRole;
}

export const METHOD_OPTIONS = {
    apiKeyRequired: false,
    methodResponses: [
        { statusCode: '200' }, // OK
        { statusCode: '400' }, // Bad Request
        { statusCode: '401' }, // Unauthorized
        { statusCode: '403' }, // Forbidden
        { statusCode: '404' }, // Not Found
        { statusCode: '500' }, // Internal Server Error
        { statusCode: '503' }, // Service Unavailable
    ],
};