import {listenToActivity} from '../index.js';

listenToActivity({
    /**
     * Pass in `true` here to fire your callback immediately when it is hooked up so you get an
     * initial value.
     *
     * Pass in `false` (or omit) to only fire your callback on future changes.
     */
    fireImmediately: true,
    listener(lastActivityAt) {
        console.info(lastActivityAt);
    },
});
