import Promise from 'bluebird';
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
        if (actionType == null) {
            throw new TypeError('Action type passed to Store#bind() is undefined');
        }

        if (typeof actionType !== 'function') {
            throw new TypeError('Action type passed to Store#bind() is not a function/constructor');
        }

        if (method == null) {
            throw new TypeError('Method passed to Store#bind() is undefined');
        }

        if (typeof method !== 'function') {
            throw new TypeError('Method passed to Store#bind() is not a function');
        }

        this._triggers.push({actionType, method});
    }

    waitFor(controller) {
        this.dispatcher.waitFor(controller._callbackId);
    }
}

function dispatchHandler(action) {
    return Promise.all(lodash.map(this._triggers, ({actionType, method}) => {
        if (action instanceof actionType) {
            const promise = Promise.try(() => {
                return method.call(this, action);
            });

            promise.catch(err => {
                this.emit('error', err);
            });

            return promise;
        }
    }));
}
