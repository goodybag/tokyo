import React, {Component, PropTypes} from 'react';
import lodash from 'lodash';
import {EventEmitter} from 'events';

export function listeningTo(propNames, eventMapping) {
    if (typeof eventMapping === 'function') {
        eventMapping = {'init change': eventMapping};
    }

    return decorator;

    function decorator(ChildComponent) {
        class ListeningContainerComponent extends Component {
            static propTypes = genPropTypes(propNames);

            static Original = ChildComponent;
            static displayName = `ListeningContainerComponent(${ChildComponent.displayName || ChildComponent.name})`;

            getEmitters(props) {
                return lodash.map(propNames, propName => props[propName]);
            }

            componentWillMount() {
                this.fireEvent('init');
            }

            componentDidMount() {
                this.startListening(this.getEmitters(this.props));
            }

            startListening(emitters) {
                lodash.each(emitters, emitter => {
                    lodash.each(this.eventHandlers, ({eventName, handler}) => {
                        emitter.on(eventName, handler);
                    });
                });
            }

            componentWillUnmount() {
                this.stopListening(this.getEmitters(this.props));
            }

            stopListening(emitters) {
                lodash.each(emitters, emitter => {
                    lodash.each(this.eventHandlers, ({eventName, handler}) => {
                        emitter.removeListener(eventName, handler);
                    });
                });
            }

            componentWillReceiveProps(nextProps) {
                this.stopListening(this.getEmitters(this.props));
                this.startListening(this.getEmitters(nextProps));
                this.fireEvent('init', nextProps);
            }

            constructor(props, context) {
                super(props, context);

                this.state = {
                    childProps: {}
                };

                this.eventHandlers = this.generateHandlers();
            }

            fireEvent(eventName, event, props) {
                lodash.chain(this.eventHandlers)
                    .where({eventName})
                    .forEach(({handler}) => {
                        handler(event, props);
                    })
                    .commit();
            }

            handleEvent(eventName, event, getter, props = this.props) {
                const component = this.refs.child;

                const newProps = getter(props, event, component);

                // if the getter returns null/undefined, ignore it's result
                if (newProps) {
                    this.setState(({childProps}) => {
                        return {
                            childProps: {...childProps, ...newProps}
                        };
                    });
                }
            }

            generateHandlers() {
                return lodash.chain(eventMapping)
                    .map((getter, key) => {
                        return lodash.map(key.split(' '), eventName => {
                            return {
                                eventName,
                                handler: (event, props) => {
                                    this.handleEvent(eventName, event, getter, props);
                                }
                            };
                        });
                    })
                    .flatten()
                    .value();
            }

            render() {
                const {childProps} = this.state;

                return (
                    <ChildComponent
                        {...this.props}
                        {...childProps}
                        ref="child"
                    />
                );
            }
        }

        return ListeningContainerComponent;
    }

    function genPropTypes(propNames) {
        return lodash.zipObject(lodash.map(propNames, propName => {
            return [propName, emitterPropType];
        }));
    }

    function emitterPropType(props, propName, componentName) {
        if (props[propName] instanceof EventEmitter) {
            return;
        } else if (props[propName] != null && typeof props[propName].on === 'function') {
            return;
        } else {
            return new TypeError(`Required prop "${propName}" is no a valid event emitter`);
        }
    }
}
