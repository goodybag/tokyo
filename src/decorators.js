import lodash from 'lodash';

export function listeningTo(storeNames, getterMethodName = 'getStateFromDependencies') {
    return decorator;

    function decorator(fn) {
        const originalCDM = fn.prototype.componentDidMount;
        const originalCWU = fn.prototype.componentWillUnmount;

        fn.prototype.componentDidMount = function componentWillMount() {
            if (originalCDM) {
                originalCDM.apply(this, arguments);
            }

            const stores = storeNames.map(name => this.context.dependencies[name]);
            const getterMethod = this[getterMethodName];

            this._setStateFromStores = () => {
                this.setState(getterMethod.call(this));
            };

            lodash.each(stores, store => {
                store.on('change', this._setStateFromStores);
            });
        };

        fn.prototype.componentWillUnmount = function componentWillMount() {
            if (originalCWU) {
                originalCWU.apply(this, arguments);
            }

            const stores = storeNames.map(name => this.context.dependencies[name]);
            const getterMethod = this[getterMethodName];

            lodash.each(stores, store => {
                store.removeListener('change', this._setStateFromStores);
            });
        };
    }
}
