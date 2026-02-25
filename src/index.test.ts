import {assert, waitUntil} from '@augment-vir/assert';
import {wait} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {assertValidFullDate, getNowInUtcTimezone, isDateAfter, type FullDate} from 'date-vir';
import {getLastActivityAt, listenToActivity} from './index.js';

describe('index.ts', () => {
    it('can be imported', async () => {
        await import('./index.js');
    });
});

describe(getLastActivityAt.name, () => {
    it('returns a FullDate', () => {
        const result = getLastActivityAt();
        assertValidFullDate(result);
    });

    it('updates after activity events', async () => {
        const before = getLastActivityAt();

        globalThis.dispatchEvent(new Event('click'));

        await waitUntil.isTrue(() => {
            const after = getLastActivityAt();

            return isDateAfter({
                fullDate: after,
                relativeTo: before,
            });
        });
    });
});

describe(listenToActivity.name, () => {
    it('calls the listener when activity is detected', async () => {
        const startedAt = getNowInUtcTimezone();
        let receivedDate: FullDate | undefined;

        const removeListener = listenToActivity({
            listener(lastActivityAt) {
                receivedDate = lastActivityAt;
            },
            debounce: {milliseconds: 1},
        });

        await wait({seconds: 1});
        globalThis.dispatchEvent(new Event('click'));

        try {
            await waitUntil.isTrue(() => {
                assertValidFullDate(receivedDate);

                return isDateAfter({
                    fullDate: receivedDate,
                    relativeTo: startedAt,
                });
            });
        } finally {
            removeListener();
        }
    });

    it('fires immediately when fireImmediately is true', async () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            fireImmediately: true,
            listener() {
                callCount++;
            },
            debounce: {milliseconds: 1},
        });

        await waitUntil.isAbove(0, () => callCount);

        removeListener();
    });

    it('does not fire immediately when fireImmediately is false', () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            fireImmediately: false,
            listener() {
                callCount++;
            },
            debounce: {milliseconds: 1},
        });

        try {
            assert.strictEquals(callCount, 0);
        } finally {
            removeListener();
        }
    });

    it('does not fire immediately when fireImmediately is omitted', () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            listener() {
                callCount++;
            },
            debounce: {milliseconds: 1},
        });

        try {
            assert.strictEquals(callCount, 0);
        } finally {
            removeListener();
        }
    });

    it('stops calling listener after removal', async () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            listener() {
                callCount++;
            },
            debounce: {milliseconds: 1},
        });

        removeListener();

        globalThis.dispatchEvent(new Event('click'));
        globalThis.dispatchEvent(new Event('click'));
        await wait({seconds: 1});
        globalThis.dispatchEvent(new Event('click'));
        globalThis.dispatchEvent(new Event('click'));
        await wait({seconds: 1});

        assert.strictEquals(callCount, 0);
    });

    it('debounces rapid activity events', async () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            listener() {
                callCount++;
            },
            debounce: {
                milliseconds: 200,
            },
        });

        /**
         * Fire many events rapidly. Due to FirstThenWait debounce style, the first call goes
         * through, then subsequent calls within the debounce window are suppressed.
         */
        for (let i = 0; i < 10; i++) {
            globalThis.dispatchEvent(new Event('mousemove'));
        }

        await wait({seconds: 2});

        try {
            assert.isBelow(callCount, 10);
        } finally {
            removeListener();
        }
    });

    it('provides a valid FullDate to the listener', async () => {
        let receivedDate: FullDate | undefined;

        const removeListener = listenToActivity({
            listener(lastActivityAt) {
                receivedDate = lastActivityAt;
            },
            debounce: {milliseconds: 1},
        });

        globalThis.dispatchEvent(new Event('keydown'));

        try {
            await waitUntil.isTrue(() => {
                assertValidFullDate(receivedDate);
                return true;
            });
        } finally {
            removeListener();
        }
    });

    it('works with default debounce when debounce is omitted', async () => {
        let callCount = 0;

        const removeListener = listenToActivity({
            listener() {
                callCount++;
            },
        });

        globalThis.dispatchEvent(new Event('click'));

        try {
            /**
             * With the default 1-second debounce the first call should fire immediately per
             * FirstThenWait style.
             */
            await waitUntil.isAbove(0, () => callCount);
        } finally {
            removeListener();
        }
    });

    it('handles async listeners', async () => {
        let completed = false;

        const removeListener = listenToActivity({
            async listener() {
                await wait({milliseconds: 100});
                completed = true;
            },
            debounce: {milliseconds: 1},
        });

        globalThis.dispatchEvent(new Event('click'));

        try {
            await waitUntil.isTrue(() => completed);
        } finally {
            removeListener();
        }
    });

    it('supports multiple concurrent listeners', async () => {
        let callCount1 = 0;
        let callCount2 = 0;

        const removeListener1 = listenToActivity({
            listener() {
                callCount1++;
            },
            debounce: {milliseconds: 1},
        });

        const removeListener2 = listenToActivity({
            listener() {
                callCount2++;
            },
            debounce: {milliseconds: 1},
        });

        globalThis.dispatchEvent(new Event('click'));

        try {
            await waitUntil.isAbove(0, () => callCount1);
            await waitUntil.isAbove(0, () => callCount2);
        } finally {
            removeListener1();
            removeListener2();
        }
    });

    it('only stops the specific listener that was removed', async () => {
        let callCount1 = 0;
        let callCount2 = 0;

        const removeListener1 = listenToActivity({
            listener() {
                callCount1++;
            },
            debounce: {milliseconds: 1},
        });

        const removeListener2 = listenToActivity({
            listener() {
                callCount2++;
            },
            debounce: {milliseconds: 1},
        });

        removeListener1();

        globalThis.dispatchEvent(new Event('click'));
        await wait({seconds: 1});

        try {
            assert.strictEquals(callCount1, 0);
            assert.isAbove(callCount2, 0);
        } finally {
            removeListener2();
        }
    });
});
