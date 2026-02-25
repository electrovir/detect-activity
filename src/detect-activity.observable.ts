import {type FullDate, getNowInUserTimezone} from 'date-vir';
import {Observable} from 'observavir';
import {eventsToListenTo} from './events.js';

const globalDocument = globalThis.document as typeof globalThis.document | undefined;

/**
 * The observable that keeps track of activity detected. This is not exported by the package as it
 * doesn't make sense to have multiple instances of it.
 */
export class DetectedActivityObservable extends Observable<FullDate> {
    constructor() {
        super({
            defaultValue: getNowInUserTimezone(),
        });
        /* node:coverage ignore next 3 */
        if (!globalDocument) {
            return;
        }

        eventsToListenTo.forEach((eventType) => {
            globalThis.addEventListener(
                eventType,
                () => {
                    this.setValue(getNowInUserTimezone());
                },
                {
                    capture: true,
                    passive: true,
                },
            );
        });
    }
}
