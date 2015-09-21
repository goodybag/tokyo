/* globals describe, it, context */
import expect from 'expect';
import {EventEmitter} from 'events';
import {Dispatcher} from 'flux';

import {Store} from '../src/Store';

class TestAction {
    constructor(value) {
        this.value = value;
    }
}

class MyStore extends Store {
    constructor(dispatcher) {
        super(dispatcher);

        this.bind(TestAction, this.handleTest);
    }

    handleTest({value}) {
        this.value = value;
    }
}

describe('Store', function() {
    it('handles actions', function() {
        const dispatcher = new Dispatcher();
        const store = new MyStore(dispatcher);

        dispatcher.dispatch(new Object());

        expect(store).toBeAn(EventEmitter);
        expect(store.value).toBe(undefined);

        dispatcher.dispatch(new TestAction(123));

        expect(store.value).toBe(123);
    });
});
