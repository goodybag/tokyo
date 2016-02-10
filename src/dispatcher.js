import Promise from 'bluebird';

export class Dispatcher {
    constructor() {
        this._callbacks = new Map();
    }

    register(callback) {
        const sym = Symbol();
        this._callbacks.set(sym, callback);
        return sym;
    }

    unregister(sym) {
        return this._callbacks.delete(sym);
    }

    dispatch(action) {
        const promises = [];

        this._callbacks.forEach(callback => {
            promises.push(callback(action));
        });

        return Promise.all(promises);
    }
}
