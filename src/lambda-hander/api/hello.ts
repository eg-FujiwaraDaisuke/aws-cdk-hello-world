// export const handler = async () => {
//     console.log('Hello World from Lambda!');
//     return {
//         statusCode: 200,
//         headers: { "Content-Type": "text/plain" },
//         body: JSON.stringify({
//             message: 'Hello World from Lambda!',
//         }),
//     };
// };

import api from ".";
import { ApiRoles, Role } from "./interfase";

export const API_ROLE_DEFS: ApiRoles[] = [
    {
        httpMethod: 'POST',
        apiRole: [
            {
                pathParameter: 'calculation-result-detail/pdf',
                requiredRole: Role.VIEWER,
            },
            {
                pathParameter: 'calculation-result-detail/pdf',
                requiredRole: Role.MAINTAINER,
            },
        ],
    },
];

/**
 * APIの実行
 */
export const handler = api(generationCharges, API_ROLE_DEFS);
export default async function generationCharges(
    context: Context,
    request: Request,
    response: Response
): Promise<void> {
    const { httpMethod } = request.event;

    switch (httpMethod) {
        case 'GET':
            await get(context, request, response);
            return;
        case 'POST':
            await post(context, request, response);
            return;
        default:
            break;
    }

    return response.error(403, `method v1 not supported: ${httpMethod}`);
}
