## Classes

<dl>
<dt><a href="#ChocolateFactory">ChocolateFactory</a></dt>
<dd><p>ChocolateFactory builds objects from templates by copying
and replacing functions with their return values. Also provides
an afterBuild-hook.</p>
</dd>
<dt><a href="#TemplateCompiler">TemplateCompiler</a></dt>
<dd></dd>
</dl>

<a name="ChocolateFactory"></a>

## ChocolateFactory
ChocolateFactory builds objects from templates by copying
and replacing functions with their return values. Also provides
an afterBuild-hook.

**Kind**: global class  

* [ChocolateFactory](#ChocolateFactory)
    * [new ChocolateFactory(templates)](#new_ChocolateFactory_new)
    * [.build(name, [trait], attributes)](#ChocolateFactory+build) ⇒ <code>Object</code>

<a name="new_ChocolateFactory_new"></a>

### new ChocolateFactory(templates)
Sets up a ChocolateFactory instance


| Param | Type | Description |
| --- | --- | --- |
| templates | <code>Object</code> | The specifications to be used when   assembling an object |

**Example**  
A new factory has to be loaded with a templates-object in a special format
where each model to be built needs its own key (the model-name):

```js
const templates = {
  user: {
    // ...
  },

  movie: {
    // ...
  }
}

const factory = new ChocolateFactory(templates)
const user = factory.build('user')
```

There are a number of ways to fill out the template-objects, from building
default-objects to generating dynamic content, traits, dependent properties
and custom properties.

### 1. Default templates and traits

Each partial-template for a model has to define a `base`-object with
default values, and may define optional traits.

```js
const template = {
  user: {
    base: {
      name: 'Tsukasa',
      age: 31
    },

    admin: {
      isAdmin: true
    }
  }
}

const factory = new ChocolateFactory(templates)

const user = factory.build('user')
const admin = factory.build('user', 'admin')
```

### 2. Dynamic values through functions

If a key is a function, ChocolateFactory will invoke it and replace it
with its return value. This way, for instance random values can be
introduced, either through `Math.random` directly or trough a third-party
library like faker.

```js
const templates = {
  user: {
    base: {
      // generate a random id
      id: () => Math.floor(Math.random() * 100),
      name: 'Jean Paul'
    }
  }
}

new ChocolateFactory(templates).build('user')

// will result in something like
{
  id: 50,
  name: 'Jean Paul'
}
```

### 3. Dependent properties

A third approach to creating objects involves an `afterBuild`-callback
that may be defined as part of the template. It gets called after the
object has been assembled and is passed in the object.

**Notice**: The callback is expected to mutate the object.

This allows to customize the result in a more dynamic manner,
for instance by re-using values that have been created in a previous step.

```js
const templates = {
  user: {
    base: {
      // generate a random id
      id: () => Math.floor(Math.random() * 1000),
      name: 'Derya'
    },

    afterBuild: user => {
      user.token = `${ user.name }::${ user.id }`
    }
  }
}

const factory = new ChocoloateFactory(templates)
const user = factory.build('user')

// user will be something like
{
  id: 123,
  name: 'Derya',
  token: 'Derya::123'
}
```

### 4. Custom properties

Finally, objects can be created with custom attributes that overwrite
**any** previously computed values. Reusing the above template, we could
build a user like this:

```js
const user = factory.build('user', {
  name: 'Manfred'
})

// will result in
{
  id: 321,
  name: 'Manfred',
  token: 'Manfred::321'
}
```

Of course, the different approaches integrate well with each other. An
object could be generated with a trait, have some dependent properties
and still accept custom properties. Here's a final, more complex example:

```js
const templates = {
  user: {
    base: {
      id: () => Math.floor(Math.random() * 100),
      name: 'No Buddy',
    },

    admin: {
      isAdmin: true
    }
  },

  message: {
    base: {
      id: () => Math.floor(Math.random() * 100),
      userId: () => Math.floor(Math.random() * 100),
      text: faker.lorem.sentence()
    },

    afterBuild: message => {
      message.token = `${ message.id }::${ message.userId }`
    }
  }
}

const factory = new ChocolateFactory(templates)

const user = factory.build('user', 'admin')
const message = factory.build('message', 'important', {
  userId: user.id
})


```
<a name="ChocolateFactory+build"></a>

### chocolateFactory.build(name, [trait], attributes) ⇒ <code>Object</code>
Wrapper function that delegates creation of objects

**Kind**: instance method of <code>[ChocolateFactory](#ChocolateFactory)</code>  
**Returns**: <code>Object</code> - object - the compiled object  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the model to construct |
| [trait] | <code>string</code> | The variant of the model to construct (optional).   Note: if no trait is given, the second argument will be attributes |
| attributes | <code>Object</code> | Additional custom attributes to set. Custom   attributes will overwrite even callback-results |

<a name="TemplateCompiler"></a>

## TemplateCompiler
**Kind**: global class  
<a name="TemplateCompiler.evaluate"></a>

### TemplateCompiler.evaluate(template) ⇒ <code>Object</code>
Replaces functions on the template with their return-values

**Kind**: static method of <code>[TemplateCompiler](#TemplateCompiler)</code>  
**Returns**: <code>Object</code> - compiledObject - A copy of the original object
  where functions are replaced with values  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Object</code> | A JavaScript object that defines what the   final object should look like. Functions will be invoked. |

