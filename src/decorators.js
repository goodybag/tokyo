import React, {Component, PropTypes} from 'react';
import lodash from 'lodash';

export function listeningTo(storeNames, getter) {
    return decorator;

    function decorator(ChildComponent) {
        class ListeningContainerComponent extends Component {
            static contextTypes = {
                dependencies: PropTypes.object.isRequired
            }

            componentDidMount() {
                const {dependencies} = this.context;
                const stores = lodash.map(storeNames, name => dependencies[name]);

                lodash.each(stores, store => {
                    store.on('change', this.setStateFromStores);
                });
            }

            componentWillUnmount() {
                const {dependencies} = this.context;
                const stores = lodash.map(storeNames, name => dependencies[name]);

                lodash.each(stores, store => {
                    store.removeListener('change', this.setStateFromStores);
                });
            }

            constructor(props, context) {
                super(props, context);

                const {dependencies} = this.context;

                this.state = {
                    childProps: getter(dependencies)
                };

                this.setStateFromStores = () => {
                    this.setState({
                        childProps: getter(dependencies)
                    });
                };
            }

            render() {
                const {childProps} = this.state;

                return <ChildComponent {...childProps}/>;
            }
        }

        return ListeningContainerComponent;
    }
}
