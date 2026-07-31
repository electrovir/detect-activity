import {Debounce, DebounceStyle} from '@augment-vir/common';
import {type AnyDuration, type FullDate} from 'date-vir';
import {DetectedActivityObservable} from './detect-activity.observable.js';

const detectActivityObservable = new DetectedActivityObservable();

/**
 * Attach a listener to listen to user activity.
 *
 * @category Main
 * @returns A callback used to remove the listener.
 */
export function listenToActivity({
    listener,
    debounce,
    fireImmediately,
}: {
    /** If true, the callback will immediately be fired with whatever the current value is. */
    fireImmediately?: boolean;
    /**
     * This listener will be called any time the user interacts with the page, per the given
     * debounce.
     */
    listener: (lastActivityAt: FullDate) => void | Promise<void>;
    /**
     * Debounce the listener being fired by this much.
     *
     * @default {seconds: 10}
     */
    debounce?: AnyDuration;
}) {
    const debounced = new Debounce(
        DebounceStyle.FirstThenWait,
        debounce || {
            seconds: 10,
        },
        async () => {
            await listener(getLastActivityAt());
        },
    );

    return detectActivityObservable.listen(fireImmediately || false, () => {
        debounced.execute();
    });
}

/**
 * Returns the latest point at which user activity was detected.
 *
 * @category Main
 */
export function getLastActivityAt(): FullDate {
    return detectActivityObservable.value;
}
