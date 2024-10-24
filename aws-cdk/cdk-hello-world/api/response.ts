type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * レスポンス
 *
 * 200 OK
 * 400 Bad Request
 * 401 Unauthorized
 * 403 Forbidden
 * 404 Not Found
 * 500 Internal Server Error
 * 503 Service Unavailable
 */
export class Response {
    public ok: boolean;
    public status: number;
    public body: Body;

    public constructor(opts?: {
        ok: boolean;
        status: number;
        body: Body;
    }) {
        const { ok, status, body } = opts ?? {};
        this.ok = ok ?? false;
        this.status = status ?? -1;
        this.body = body ?? {};
    }

    public success(status: number, body: Body = {}): void {
        this.status = status;
        this.body = body;
        this.ok = true;
    }

    public error(status: number, errMsg: string): void {
        this.status = status;
        this.body = { message: errMsg };
        this.ok = false;
    }

    public errors(status: number, messages: string[]): void {
        this.status = status;
        this.body = { messages };
        this.ok = false;
    }
}
