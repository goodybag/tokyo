import React, {Component, PropTypes} from 'react';
import lodash from 'lodash';

export function listeningTo(storeTokens = [], getter) {
    if (storeTokens.some(token => token === undefined)) {
        throw new TypeError('@listeningTo cannot handle undefined tokens');
    }

    return decorator;

    function decorator(ChildComponent) {
        class ListeningContainerComponent extends Component {
            static contextTypes = {
                dependencyCache: PropTypes.instanceOf(Map)
            }

            static Original = ChildComponent

            getStores() {
                const {dependencyCache} = this.context;

                return lodash.map(storeTokens, token => {
                    if (typeof token === 'string') {
                        return this.props[token];
                    } else {
                        if (dependencyCache.has(token)) {
                            return dependencyCache.get(token);
                        } else {
                            throw new RangeError(`@listeningTo cannot find ${token.name || token} in dependency cache`);
                        }
                    }
                });
            }

            componentDidMount() {
                lodash.each(this.getStores(), store => {
                    store.on('change', this.setStateFromStores);
                });
            }

            componentWillUnmount() {
                lodash.each(this.getStores(), store => {
                    store.removeListener('change', this.setStateFromStores);
                });
            }

            constructor(props, context) {
                super(props, context);

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
