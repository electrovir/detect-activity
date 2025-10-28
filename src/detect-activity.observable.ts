import {type FullDate, getNowInUserTimezone} from 'date-vir';
import {Observable} from 'observavir';

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

const eventsToListenTo = [
    'click',
    'pointerup',
    'contextmenu',
    'touchend',
    'pointerdown',
    'keydown',
    'touchstart',
    'wheel',
    'scroll',
    'keypress',
    'keyup',
    'focus',
];
