import {assert, waitUntil} from '@augment-vir/assert';
import {wait} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {isDateAfter, isValidFullDate} from 'date-vir';
import {DetectedActivityObservable} from './detect-activity.observable.js';
import {eventsToListenTo} from './events.js';

describe('DetectedActivityObservable', () => {
    it('can be constructed', () => {
        const observable = new DetectedActivityObservable();
        try {
            assert.isDefined(observable);
        } finally {
            observable.destroy();
        }
    });

    it('has a FullDate value upon construction', () => {
        const observable = new DetectedActivityObservable();
        try {
            assert.isTrue(isValidFullDate(observable.value));
        } finally {
            observable.destroy();
        }
    });

    eventsToListenTo.forEach((eventName) => {
        it(`updates on '${eventName}' event`, async () => {
            const observable = new DetectedActivityObservable();
            const valueBefore = observable.value;

            await wait({
                seconds: 1,
            });

            globalThis.dispatchEvent(new Event(eventName));
            try {
                await waitUntil.isTrue(() => {
                    return isDateAfter({
                        fullDate: observable.value,
                        relativeTo: valueBefore,
                    });
                });
            } finally {
                observable.destroy();
            }
        });
    });

    it('fires listeners when activity events occur', async () => {
        const observable = new DetectedActivityObservable();
        let listenerCallCount = 0;

        observable.listen(false, () => {
            listenerCallCount++;
        });

        globalThis.dispatchEvent(new Event('click'));

        globalThis.dispatchEvent(new Event('mousemove'));

        try {
            await waitUntil.isAbove(0, () => listenerCallCount);
        } finally {
            observable.destroy();
        }
    });

    it('fires listener immediately with fireImmediately=true', () => {
        const observable = new DetectedActivityObservable();
        let fired = false;

        observable.listen(true, () => {
            fired = true;
        });

        try {
            assert.isTrue(fired);
        } finally {
            observable.destroy();
        }
    });

    it('does not fire listener immediately with fireImmediately=false', () => {
        const observable = new DetectedActivityObservable();
        let fired = false;

        observable.listen(false, () => {
            fired = true;
        });

        try {
            assert.isFalse(fired);
        } finally {
            observable.destroy();
        }
    });

    it('returns a remove listener callback', () => {
        const observable = new DetectedActivityObservable();

        const removeListener = observable.listen(false, () => {});

        try {
            assert.isFunction(removeListener);
        } finally {
            observable.destroy();
        }
    });

    it('stops receiving events after listener removal', async () => {
        const observable = new DetectedActivityObservable();
        let callCount = 0;

        const removeListener = observable.listen(false, () => {
            callCount++;
        });

        removeListener();

        globalThis.dispatchEvent(new Event('click'));

        await wait({
            seconds: 1,
        });

        try {
            assert.strictEquals(callCount, 0);
        } finally {
            observable.destroy();
        }
    });
});
