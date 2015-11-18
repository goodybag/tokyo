import React, {Component, PropTypes} from 'react';
import lodash from 'lodash';

export function listeningTo(storeTokens, getter) {
    return decorator;

    function decorator(ChildComponent) {
        class ListeningContainerComponent extends Component {
            static contextTypes = {
                dependencyCache: PropTypes.instanceOf(Map)
            }

            static Original = ChildComponent

            getStores() {
                const {dependencyCache} = this.context;

                return lodash.map(storeTokens, name => {
                    if (typeof this.props[name] === 'string') {
                        return this.props[name];
                    } else {
                        return dependencyCache.get([name]);
                    }
                });
            }

            componentDidMount() {
                lodash.each(this.stores, store => {
                    store.on('change', this.setStateFromStores);
                });
            }

            componentWillUnmount() {
                lodash.each(this.stores, store => {
                    store.removeListener('change', this.setStateFromStores);
                });
            }

            constructor(props, context) {
                super(props, context);

                this.stores = this.getStores();

                this.state = {
                    childProps: getter(this.props)
                };

                this.setStateFromStores = () => {
                    this.setState({
                        childProps: getter(this.props)
                    });
                };
            }

            render() {
                const {childProps} = this.state;

                return <ChildComponent {...this.props} {...childProps}/>;
            }
        }

        return ListeningContainerComponent;
    }
}
