## Classes

<dl>
<dt><a href="#ChocolateFactory">ChocolateFactory</a></dt>
<dd><p>ChocolateFactory constructs objects from templates by
  copying and interpolating values.</p>
<p>  Templates have to follow some conventions. The template for each class
  has to define at least a <code>base</code> case, the default values that the
  fabricated object should have. If values need to be interpolated,
  the interpolator will look in the <code>options</code>-section for functions
  called <code>generateSomevalue</code>, so the options-section has to be provided.
  Finally, if traits should be created, the name of the trait has to
  be specified along with the attributes it should set. See the examples
  for more information.</p>
</dd>
<dt><a href="#TemplateCompiler">TemplateCompiler</a></dt>
<dd><p>Helper class that transforms templates to JavaScript objects.
  Includes a very simple interpolation-engine.</p>
<p>  Each instance keeps track of a seed that is needed when calling
  the template-functions. In particular, each template-function gets
  passed an instance of <code>random-seed</code> that is seeded with the compiler&#39;s
  seed. This way, repeated calls of the same template function will
  result in identical results while multiple instances of the compiler
  can compile different objects from the same template.</p>
</dd>
</dl>

<a name="ChocolateFactory"></a>

## ChocolateFactory
ChocolateFactory constructs objects from templates by
  copying and interpolating values.

  Templates have to follow some conventions. The template for each class
  has to define at least a `base` case, the default values that the
  fabricated object should have. If values need to be interpolated,
  the interpolator will look in the `options`-section for functions
  called `generateSomevalue`, so the options-section has to be provided.
  Finally, if traits should be created, the name of the trait has to
  be specified along with the attributes it should set. See the examples
  for more information.

**Kind**: global class  

* [ChocolateFactory](#ChocolateFactory)
    * [new ChocolateFactory(templates, options)](#new_ChocolateFactory_new)
    * [.build(name, [trait], attributes)](#ChocolateFactory+build) ⇒ <code>Object</code>

<a name="new_ChocolateFactory_new"></a>

### new ChocolateFactory(templates, options)
Sets up a ChocolateFactory instance


| Param | Type | Description |
| --- | --- | --- |
| templates | <code>Object</code> | The object-definitions to be used later |
| options | <code>Object</code> | Additional options. Currently, a seed can   be passed, mostly to make tests deterministic. |

**Example**  
```js
const templates = {
 // chose a model-name for later reference
 user: {

   // for each model, define a base-case with default values
   base: {

     // this is a static value that will not be interpolated
     name: 'Tsukasa'
   }
 },
 message: {
   base: {
     text: 'I have nothing to say'
   }
 }
}

const factory = new ChololateFactory(templates)

// creates { name: 'Tsukasa' }
factory.build('user')

// creates { text: 'I have nothing to say' }
factory.build('message')

// add custom attributes if needed. creates { name: 'Tsukasa', admin: true }
factory.build('user', {admin: true})
```
**Example**  
```js
const templates = {
 user: {
   base: {
     // interpolation. will expect `user.options.generateId` to exist
     id: '{{ id }},
     name: 'Tsukasa'
   },

   // define traits by naming them anything but `base` and `options`
   admin: {
     isAdmin: true
   },

   // define one function for each interpolation-key. The function associated
   // with `key` is called `generateKey` and is passed a random-seed object.
   // The returned value will replace '{{ key }}' in the final object.
   options: {
     generateId: rand => rand(50)
   }

 }
}

const factory = new ChocolateFactory(templates)

// creates a basic user with id set to a random value
factory.build('user')

// creates a trait
factory.build('user', 'admin')

// enhance traits with custom attributes
factory.build('user', 'admin', {age: 83})
```
<a name="ChocolateFactory+build"></a>

### chocolateFactory.build(name, [trait], attributes) ⇒ <code>Object</code>
Wrapper function that delegates creation of objects

**Kind**: instance method of <code>[ChocolateFactory](#ChocolateFactory)</code>  
**Returns**: <code>Object</code> - object - the compiled object  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the model to construct |
| [trait] | <code>string</code> | The variant of the model to construct (optional) |
| attributes | <code>Object</code> | Additional custom attributes to set |

<a name="TemplateCompiler"></a>

## TemplateCompiler
Helper class that transforms templates to JavaScript objects.
  Includes a very simple interpolation-engine.

  Each instance keeps track of a seed that is needed when calling
  the template-functions. In particular, each template-function gets
  passed an instance of `random-seed` that is seeded with the compiler's
  seed. This way, repeated calls of the same template function will
  result in identical results while multiple instances of the compiler
  can compile different objects from the same template.

**Kind**: global class  

* [TemplateCompiler](#TemplateCompiler)
    * [new TemplateCompiler(seed)](#new_TemplateCompiler_new)
    * [.compile(template, options)](#TemplateCompiler+compile) ⇒ <code>Object</code>

<a name="new_TemplateCompiler_new"></a>

### new TemplateCompiler(seed)

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>number</code> | The random number generator seed that will be   attached to the compiler instance. Setting this manuall is mostly   useful during testing to ensure that results are reproducible. |

**Example**  
```js
const compiler = new TemplateCompiler()

// each time 'id' will be interpolated, the same random number is inserted
const template = {
  id: '{{ id }}',
  name: '{{ name }}',
  admin: false,

  session: {
    token: '{{ name }}::{{ id }}::{{ hash }}'
  }
}

// each interpolation key `key` expects a corresponding method `generateKey`
const options = {
  // returns a random id
  generateId: rand => rand(100),

  // returna a random name
  generateName: rand => ['Ashish', 'Derya', 'Jo'][rand(3)],

  // returns a random hash
  generateHash: rand => rand.hashString(rand.string(10))
}

compiler.compile(template, options)

// this will generate an object like the following:
{
  id: 7,
  name: 'Derya',
  admin: false,

  session: {
    // note how name and id match the above values
    token: 'Derya::7::a787a3nks93s987'
  }
}
```
<a name="TemplateCompiler+compile"></a>

### templateCompiler.compile(template, options) ⇒ <code>Object</code>
Transforms a given template using the options.
For an example see the class description.

**Kind**: instance method of <code>[TemplateCompiler](#TemplateCompiler)</code>  
**Returns**: <code>Object</code> - compiledObject - The original object with
  interpolated values  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Object</code> | A JavaScript object that defines what the   final object should look like. String-values will be interpolated. |
| options | <code>Object</code> | An object where each value is a function,   corresponding to the template-key to be interpolated. |

