# The Chocolate Factory

A simple template-based object-builder with some dynamic capabilities.

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

// this generates the expected static default objects

// user
{
  name: 'Tsukasa',
  age: 31
}

// admin
{
  name: 'Tsukasa',
  age: 31,
  isAdmin: true
}
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
object has been assembled and gets the object passed in just before it's
returned to the caller.

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
      // the token depends on the random id
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
and still accept custom properties. As a final, and more complex scenario,
let's consider the following example:

```js
/***
 * Setting up an association
 *
 * Say we have users and messages and we'd like to associate them such
 * that we know that a message belongs to a particular user. We therefore
 * store a foreign key 'userId' with each message.
 *
 * But there's a catch: each message should also have a token that depends on
 * its own id and its userId. This token is a 'dependent property' because
 * it depends on other properties of the message, so we define it via an
 * 'afterBuild'-callback so it's computed after the rest of the object
 * has been assembled.
 *
 * Here's how we can generate some testing data that has
 * the required structure.
 */

// let's setup the templates
const userTemplate = {
  base: {
    // the user has a random id
    id: () => Math.floor(Math.random() * 100),
    name: 'No Buddy',
  }
}

const messageTemplate = {
  base: {
    // each message also has a random id
    id: () => Math.floor(Math.random() * 100),
    text: faker.lorem.sentence(),

    // in the absence of a userId, we generate a ranom one
    userId: () => Math.floor(Math.random() * 100)
  },

  important: {
    urgent: true
  },

  afterBuild: message => {
    // the token depends on both the id and userId
    message.token = `${ message.id }::${ message.userId }`
  }
}

const factory = new ChocolateFactory({
  user: userTemplate,
  message: messageTemplate
})

// create a user (with a random id)
const user = factory.build('user')

// associate message and user by specifying the forein key
const message = factory.build('message', 'important', {
  userId: user.id
})

// this results in something like the following two objects

// user
{
  // a random id
  id: 123,
  name: 'No Buddy'
}

// message
{
  // a random id
  id: 456,

  // the manually set userId
  userId: 123,

  // the token is valid event though the userId was set manually
  token: '456::123',

  // a property that was generated dynamically
  text: 'lorem ipsum',

  // a static property that belongs to the trait
  urgent: true
}
```
