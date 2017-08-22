# Terrific Singleton

Terrific singleton is a small wrapper for terrific.  
Features:
+ Fixed memory leaks of stop method
+ Allows to use ES6 classes for module creation
+ Utils for easier react/angular integration


## Supports classic terrific usage

If you don't need intellisense and other advantages of ES6 classes
you can still use the old object annoation

```js
import { createModule } from 'terrific-singleton'

createModule('DatePicker', {
  start(resolve) {
    resolve()
  }
})
```

## ES6 classes

With ES6 classes you get better intellisense and other advantages of ES6 classes
and typings.

```js
import { createModule } from 'terrific-singleton'
import { TerrificSpec } from 'terrific-singleton/terrific-module'

export default class DatePicker extends TerrificSpec {
  start(resolve) {
    resolve()
  }
} 
createModule('DatePicker', DatePicker)
```


## Typings for modules

This package provides typings for your classes

```js
import { createModule } from 'terrific-singleton'
import { TerrificSpec } from 'terrific-singleton/terrific-module'

export default class DatePicker extends TerrificSpec {
  start(resolve) {
    resolve()
  }
} 
createModule('DatePicker', DatePicker)
```


## Decorators

Instead of calling create module after the class you can also use createModule as a decorator

```js
import { createModule } from 'terrific-singleton'
import { TerrificSpec } from 'terrific-singleton/terrific-module'

@createModule('DatePicker')
export default class DatePicker extends TerrificSpec {
  start(resolve) {
    resolve()
  }
} 
```

## Utility features

### `startNode` 

Allows you to start a specific dom node after the DOM ready event

```js
const demo = document.querySelector('.demo')
startNode(demo).then((moduleInstance) => console.log(moduleInstance, 'was loaded'))
```


### `getModuleByDomNode`

Returns the terrific module instance to call public methods e.g. from React or Angular


```js
const demo = document.querySelector('.demo')
const mod = getModuleByDomNode(demo)
mod.setValue('bar')
```

### `stopNode`

Tears down a module


```js
const demo = document.querySelector('.demo')
stopNode(demo)
```

### `waitForBootstrap`

Returns a promise which will be fullfilled once the initial bootstrap is complete
This might be handy if your Angular or React bridge is waiting for the modules to be available for the very first time

```js
waitForBootstrap().then(() => console.log('Initial bootstrap complete.'))
```

### `waitForModuleInitialisiation`

Same like `waitForBootstrap` but it will also work for components which boot lazy after the initial bootstrap  
This might be handy if you boot components with Angular or React

```js
waitForModuleInitialisiation().then(() => console.log('All modules are initialized'))
```

### `bootstrap`

Start all terrific components which where registrered and initialize all terrific modules found in the current dom
This is a replacemant for the terrific `application.registerModules()` and `application.start()` methods.

```js
document.addEventListener('DOMContentLoaded', bootstrap)
```

### `createModule`

Same api like the original `createModule` but with additional support for ES6 classes and decorators

Legacy
```js
createModule('DatePicker', {

})
```

ES6 classes
```js
export default class DatePicker { .. }
createModule('DatePicker', DatePicker)
```

ES6 classes and decorators
```js
@createModule('DatePicker')
export default class DatePicker extends TerrificSpec {
```

# Unit tests

This module is unit tested with a code coverage of 100%
