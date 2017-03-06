import rand from 'random-seed'
import {deepMap, reviveValues} from './utils'

/**
 * @class
 *
 * @classdesc Helper class that transforms templates to JavaScript objects.
 *   Includes a very simple interpolation-engine.
 *
 *   Each instance keeps track of a seed that is needed when calling
 *   the template-functions. In particular, each template-function gets
 *   passed an instance of `random-seed` that is seeded with the compiler's
 *   seed. This way, repeated calls of the same template function will
 *   result in identical results while multiple instances of the compiler
 *   can compile different objects from the same template.
 *
 * @example
 * ```js
 * const compiler = new TemplateCompiler()
 *
 * // each time 'id' will be interpolated, the same random number is inserted
 * const template = {
 *   id: '{{ id }}',
 *   name: '{{ name }}',
 *   admin: false,
 *
 *   session: {
 *     token: '{{ name }}::{{ id }}::{{ hash }}'
 *   }
 * }
 *
 * // each interpolation key `key` expects a corresponding method `generateKey`
 * const options = {
 *   // returns a random id
 *   generateId: rand => rand(100),
 *
 *   // returna a random name
 *   generateName: rand => ['Ashish', 'Derya', 'Jo'][rand(3)],
 *
 *   // returns a random hash (using md5-library)
 *   generateHash: rand => md5(rand.string(10))
 * }
 *
 * compiler.compile(template, options)
 *
 * // this will generate an object like the following:
 * {
 *   id: 7,
 *   name: 'Derya',
 *   admin: false,
 *
 *   session: {
 *     // note how name and id match the above values
 *     token: 'Derya::7::a787a3nks93s987'
 *   }
 * }
 * ```
 */
class TemplateCompiler {
  /**
   * @constructor
   *
   * @param {number} seed - The random number generator seed that will be
   *   attached to the compiler instance. Setting this manuall is mostly
   *   useful during testing to ensure that results are reproducible.
   */
  constructor (seed) {
    this.seed = seed || Math.random()
    this.rand = rand.create()
  }

  /**
   * Transforms a given template using the options.
   * For an example see the class description.
   *
   * @param {Object} template - A JavaScript object that defines what the
   *   final object should look like. String-values will be interpolated.
   *
   * @param {Object} options - An object where each value is a function,
   *   corresponding to the template-key to be interpolated.
   *
   * @returns {Object} compiledObject - The original object with
   *   interpolated values
   */
  compile (template, options) {
    return reviveValues(deepMap(template, value => {
      if (typeof value !== 'string') return value

      return value.replace(/{{\s*\w+\s*}}/g, subString => {
        if (!options) throw new Error('missing argument: options')

        // reduce '{{ id }}' to 'id'
        let variable = subString.match(/{{\s*(\w+)+\s*}}/)[1]

        // and create full function name like 'generateId'
        let fn = `generate${variable[0].toUpperCase() + variable.slice(1)}`

        // call the function with freshly seeded rand-object
        if (!options[fn]) throw new Error(`could not find options.${fn}`)

        this.rand.seed(this.seed.toString() + fn)
        return options[fn](this.rand)
      })
    }))
  }
}

export default TemplateCompiler
