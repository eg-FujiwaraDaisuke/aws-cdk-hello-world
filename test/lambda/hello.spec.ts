
import { describe, it, expect } from 'vitest';
import { handler } from '../../lambda/hello';

describe('Lambda Handler', () => {
    it('should return a valid response', async () => {
        const response = await handler();

        expect(response.statusCode).toBe(200);
        expect(response.headers).toEqual({ "Content-Type": "text/plain" });
        expect(JSON.parse(response.body)).toEqual({
            message: 'Hello World from Lambda!',
        });
    });
});