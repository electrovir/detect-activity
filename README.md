# detect-changes

Check and listen to user activity.

## Installation

```sh
npm i detect-changes
```

## Usage

Use `listenToActivity` to setup a page activation listener. You can setup multiple listeners without any issues.

<!-- example-link: src/readme-examples/listen.example.ts -->

```TypeScript
import {listenToActivity} from 'detect-changes';

listenToActivity(
    /**
     * Pass in `true` here to fire your callback immediately when it is hooked up so you get an
     * initial value.
     *
     * Pass in `false` to only fire your callback on future changes.
     */
    true,
    (isActive) => console.info(isActive),
);
```

At any time you can also call `getLastActivityAt` to get last activity time:

<!-- example-link: src/readme-examples/get-current-value.example.ts -->

```TypeScript
import {getLastActivityAt} from 'detect-changes';

console.info(getLastActivityAt());
```
