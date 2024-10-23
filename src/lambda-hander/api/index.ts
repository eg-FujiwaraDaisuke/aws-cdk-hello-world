// import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export default function api(
    handler: (context: Context, request: Request, response: Response) => Promise<void>,
    roleDefs: API_ROLE_DEFS
) {
    return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
        const request = {
            event,
            body: event.body ? JSON.parse(event.body) : null,
            headers: event.headers,
            httpMethod: event.httpMethod,
            // 必要に応じて他のプロパティを追加
        };

        const response = {
            success: (data: any) => ({
                statusCode: 200,
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            }),
            error: (statusCode: number, message: string) => ({
                statusCode,
                body: JSON.stringify({ message }),
                headers: { "Content-Type": "application/json" },
            }),
        };

        try {
            // 認証やロールチェックをここで行うことができる
            // 例: checkAuthorization(roleDefs);

            await handler(context, request, response);
        } catch (error) {
            console.error('Error handling request:', error);
            return response.error(500, 'Internal Server Error');
        }

        return response.success({ message: 'Request processed successfully.' });
    };
}