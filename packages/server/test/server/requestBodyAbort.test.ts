import { vi } from 'vitest';

import { readRequestBody } from '../../src/server/requestBody';

describe('readRequestBody cancellation', () => {
    test('rejects a pre-aborted signal without locking the body', async () => {
        const controller = new AbortController();
        const reason = new Error('deadline');
        controller.abort(reason);
        const request = new Request('http://localhost', { method: 'POST', body: '{}' });

        await expect(readRequestBody(request, undefined, controller.signal)).rejects.toBe(reason);
        expect(request.body?.locked).toBe(false);
        expect(await request.text()).toBe('{}');
    });

    test.each([false, true])('aborts a pending read even when cancellation rejects: %s', async rejects => {
        const controller = new AbortController();
        const reason = new Error('deadline');
        const cancel = vi.fn(() => (rejects ? Promise.reject(new Error('cancel failed')) : new Promise<void>(() => {})));
        const request = new Request('http://localhost', {
            method: 'POST',
            body: new ReadableStream<Uint8Array>({ cancel }, { highWaterMark: 0 }),
            duplex: 'half'
        } as RequestInit);
        const reading = readRequestBody(request, undefined, controller.signal);
        const rejected = expect(reading).rejects.toBe(reason);
        controller.abort(reason);

        await rejected;
        expect(cancel).toHaveBeenCalledWith(reason);
        expect(request.body?.locked).toBe(false);
    });
});
