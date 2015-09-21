import {EventEmitter} from 'events';
import lodash from 'lodash';

export class Store extends EventEmitter {
    constructor(dispatcher) {
        super();

        this.dispatcher = dispatcher;
        this._callbackId = dispatcher.register(dispatchHandler.bind(this));
        this._triggers = [];
    }

    bind(actionType, method) {
        this._triggers.push({actionType, method});
    }

    waitFor(controller) {
        this.dispatcher.waitFor(controller._callbackId);
    }
}

function dispatchHandler(action) {
    lodash.each(this._triggers, ({actionType, method}) => {
        if (action instanceof actionType) {
            method.call(this, action);
        }
    });
}
