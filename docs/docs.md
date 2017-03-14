<a name="ChocolateFactory"></a>

## ChocolateFactory
ChocolateFactory builds objects from templates by copying
and replacing functions with their return values. Also provides
an afterBuild-hook.

**Kind**: global class  

* [ChocolateFactory](#ChocolateFactory)
    * [new ChocolateFactory(templates)](#new_ChocolateFactory_new)
    * [.build(name, [trait], [attributes])](#ChocolateFactory+build) ⇒ <code>Object</code>

<a name="new_ChocolateFactory_new"></a>

### new ChocolateFactory(templates)
Sets up a ChocolateFactory instance


| Param | Type | Description |
| --- | --- | --- |
| templates | <code>Object</code> | The specifications to be used when   assembling an object |

<a name="ChocolateFactory+build"></a>

### chocolateFactory.build(name, [trait], [attributes]) ⇒ <code>Object</code>
Wrapper function that delegates creation of objects

**Kind**: instance method of <code>[ChocolateFactory](#ChocolateFactory)</code>  
**Returns**: <code>Object</code> - object - the compiled object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the model to construct |
| [trait] | <code>string</code> |  | The variant of the model to construct (optional).   Note: if no trait is given, the second argument will be attributes |
| [attributes] | <code>Object</code> | <code>{}</code> | Additional custom attributes to set. Custom   attributes will overwrite even callback-results |

