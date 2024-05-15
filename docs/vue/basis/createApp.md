# createApp

## 简介

```js
import { createApp } from 'vue'

const app = createApp({}).mount()
```

这个方法创建一个应用实例，

## 源码解析

### 基础

1. 找到源码导出的位置：`packages/vue/src/index.ts`中最后一行`export * from '@vue/runtime-dom'`
2. 找到`packages/runtime-dom/src/index.ts`中搜索代码`createApp`即可找到源码
```ts
export const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args)

  if (__DEV__) {
    // 此方法涉及app.component时在开发环境下控制台提示
    injectNativeTagCheck(app)
    injectCompilerOptionsCheck(app)
  }

  const { mount } = app
  app.mount = (containerOrSelector: Element | ShadowRoot | string): any => {
    // ... 
  }

  return app
}) as CreateAppFunction<Element>
```
3. 方法内首行调用了`ensureRenderer`方法，在文件里搜索发现该方法调用`createRenderer`方法，位置在`packages/runtime-core/src/renderer.ts`这个方法返回`baseCreateRenderer`
4. `baseCreateRenderer`方法内容有点多，经过一番处理后，返回值如下：
```ts
function baseCreateRenderer(
  options: RendererOptions,
  createHydrationFns?: typeof createHydrationFunctions
): any {
  // ...
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate),
  }
}
```
这里我们只关注`createApp`相关方法。接着把生成的`render`传给`createAppAPI`方法。

5. `packages/runtime-core/src/apiCreateApp.ts`中找到`createAppAPI`方法，返回一个函数接收`2`中调用`createApp`传入的参数。
```ts
export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>,
  hydrate?: RootHydrateFunction,
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent)
    }
    if (rootProps != null && !isObject(rootProps)) {
      __DEV__ && warn(`root props passed to app.mount() must be an object.`)
      rootProps = null
    }

    const context = createAppContext()
    const installedPlugins = new WeakSet()

    let isMounted = false

    const app: App = (context.app = {
      // ...
    })
    return app
  }
}
```
上面代码调用了`createAppContext`方法，该方法返回一个对象，该对象包含`app`、`config`、`context`等属性。

6. `createAppContext`方法：
```ts
export function createAppContext(): AppContext {
  return {
    app: null as any,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: undefined,
      warnHandler: undefined,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  }
}
```

### app.mount()

在`createApp`方法中重写了在`createAppAPI`方法中返回的`mount`方法。最后将`app`返回，我们才能在使用Vue返回的`createApp`方法时挂载节点。

`mount`方法接收一个参数，该参数的类型是DOM节点、ShadownRoot或者CSS选择器（使用第一个匹配到的元素）。返回根组件的实例，**mount仅能调用一次**

//todo

### app.unmount()

//todo

### app.component()

```ts
component(name: string, component?: Component): any {
  if (__DEV__) {
    // 开发环境下 如果name属于HTML标签 SVG标签 数学标记语言 slot或者component 抛出提示
    validateComponentName(name, context.config)
  }
  if (!component) {
    // 只穿了组件名称 被认为获取组件
    return context.components[name]
  }
  if (__DEV__ && context.components[name]) {
    // 开发环境下抛出提示 此时组件已经注册过
    warn(`Component "${name}" has already been registered in target app.`)
  }
  // 注册组件
  context.components[name] = component
  return app
}
```

### app.directive()

//todo

### app.use()

```ts
// packages/runtime-core/src/apiCreateApp.ts createAppAPI
const installedPlugins = new WeakSet()

use(plugin: Plugin, ...options: any[]) {
  if (installedPlugins.has(plugin)) {
    __DEV__ && warn(`Plugin has already been applied to target app.`)
  } else if (plugin && isFunction(plugin.install)) {
    installedPlugins.add(plugin)
    plugin.install(app, ...options)
  } else if (isFunction(plugin)) {
    installedPlugins.add(plugin)
    plugin(app, ...options)
  } else if (__DEV__) {
    warn(
      `A plugin must either be a function or an object with an "install" ` +
        `function.`,
    )
  }
  return app
}
```
在使用这个方法时，写法如下：
```ts
const app = createApp({})
const myPlugin = {
  install(app, options) {}
}
app.use(myPlugin, {})
```

### app.mixin()

//todo

### app.provide()

//todo

### app.runWithContext()

//todo

### app.version

//todo

### app.config

```ts
// packages/runtime-core/src/apiCreateApp.ts createAppAPI

get config() {
  return context.config
},

set config(v) {
  if (__DEV__) {
    warn(
      `app.config cannot be replaced. Modify individual options instead.`,
    )
  }
}
```
这个`context`就是`createAppContext`方法返回的对象。