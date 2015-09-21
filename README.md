tokyo [![Build Status](http://img.shields.io/travis/goodybag/tokyo.svg?style=flat)](https://travis-ci.org/goodybag/tokyo) [![NPM Version](http://img.shields.io/npm/v/tokyo.svg?style=flat)](https://npmjs.org/package/tokyo) [![License](http://img.shields.io/npm/l/tokyo.svg?style=flat)](https://github.com/goodybag/tokyo/blob/master/LICENSE)
=========

Tokyo is a foundation for building Flux-like applications. It provides simple
base classes and helpers for setting up stores and components. It is inspired
by [Fluxxor](https://github.com/BinaryMuse/fluxxor) and
[Flux](https://github.com/facebook/flux). It uses Flux's dispatcher class but
uses classes as identifiers for actions instead of string constants. It is
intended to be used with the libraries
[Yokohama](https://github.com/goodybag/yokohama) (for dependency resolution)
and [Hiroshima](https://github.com/goodybag/hiroshima) (for routing).

Usage
-----

```js
import React, {Component} from 'react';
import {Resolver, dependencies, inject, injectPromise} from 'yokohama';
import {Dispatcher} from 'flux';
import {Store} from 'tokyo';
import {RouteParams} from 'somewhere-else';

class CreateTaskAction {
    constructor(title) {
        this.title = title;
    }
}

@injectPromise()
function ResolveTasks() {
    const tasks = new Backbone.Collection([], {url: '/tasks'});

    return tasks.fetch().return(tasks);
}

@inject(Dispatcher, ResolveTasks)
class TasksStore extends Store {
    constructor(dispatcher, tasks) {
        super(dispatcher);

        this.tasks = tasks;
        this.tasks.on('add change remove', () => this.emit('change'));

        this.bind(CreateTaskAction, this.handleCreateTask);
    }

    handleCreateTask({title}) {
        this.tasks.add({title});
    }

    getTasks() {
        return this.tasks;
    }
}

@dependencies({tasksStore: TasksStore})
class TasksComponent extends Component {
    // ...
}

Resolver.from(TasksComponent).resolve().then(function(dependencies) {
    dependencies.tasksStore instanceof TasksStore; // true

    React.render(<TasksComponent data={dependencies}/>, document.body);
});
```

Documentation
-------------

TODO
