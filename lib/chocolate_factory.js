import _ from 'lodash'

import TemplateCompiler from './template_compiler'

/**
 * @class
 *
 * @classdesc ChocolateFactory constructs objects from templates by
 *   copying and interpolating values.
 *
 *   Templates have to follow some conventions. The template for each class
 *   has to define at least a `base` case, the default values that the
 *   fabricated object should have. If values need to be interpolated,
 *   the interpolator will look in the `options`-section for functions
 *   called `generateSomevalue`, so the options-section has to be provided.
 *   Finally, if traits should be created, the name of the trait has to
 *   be specified along with the attributes it should set. See the examples
 *   for more information.
 *
 * @example
 * ```js
 * const templates = {
 *  // chose a model-name for later reference
 *  user: {
 *
 *    // for each model, define a base-case with default values
 *    base: {
 *
 *      // this is a static value that will not be interpolated
 *      name: 'Tsukasa'
 *    }
 *  },
 *  message: {
 *    base: {
 *      text: 'I have nothing to say'
 *    }
 *  }
 * }
 *
 * const factory = new ChololateFactory(templates)
 *
 * // creates { name: 'Tsukasa' }
 * factory.build('user')
 *
 * // creates { text: 'I have nothing to say' }
 * factory.build('message')
 *
 * // add custom attributes if needed. creates { name: 'Tsukasa', admin: true }
 * factory.build('user', {admin: true})
 * ```
 *
 * @example
 * ```js
 * const templates = {
 *  user: {
 *    base: {
 *      // interpolation. will expect `user.options.generateId` to exist
 *      id: '{{ id }},
 *      name: 'Tsukasa'
 *    },
 *
 *    // define traits by naming them anything but `base` and `options`
 *    admin: {
 *      isAdmin: true
 *    },
 *
 *    // define one function for each interpolation-key. The function associated
 *    // with `key` is called `generateKey` and is passed a random-seed object.
 *    // The returned value will replace '{{ key }}' in the final object.
 *    options: {
 *      generateId: rand => rand(50)
 *    }
 *
 *  }
 * }
 *
 * const factory = new ChocolateFactory(templates)
 *
 * // creates a basic user with id set to a random value
 * factory.build('user')
 *
 * // creates a trait
 * factory.build('user', 'admin')
 *
 * // enhance traits with custom attributes
 * factory.build('user', 'admin', {age: 83})
 * ```
 */
class ChocolateFactory {
  /**
   * Sets up a ChocolateFactory instance
   * @constructor
   *
   * @param {Object} templates - The object-definitions to be used later
   * @param {Object} options - Additional options. Currently, a seed can
   *   be passed, mostly to make tests deterministic.
   */
  constructor (templates, options = {}) {
    if (options.seed) this.seed = options.seed
    this.templates = templates
  }

  /**
   * Wrapper function that delegates creation of objects
   *
   * @param {string} name - The name of the model to construct
   * @param {string=} trait - The variant of the model to construct (optional)
   * @param {Object} attributes - Additional custom attributes to set
   *
   * @returns {Object} object - the compiled object
   */
  build (name, trait, attributes = {}) {
    if (trait && typeof trait === 'string') {
      return this._buildTrait(name, trait, attributes)
    }

    // trait is optional, so second argument might actually be attributes
    if (trait && typeof trait === 'object') {
      return this._buildBase(name, trait)
    }

    return this._buildBase(name)
  }

  /** @private */
  _buildBase (name, attributes = {}) {
    const compiler = new TemplateCompiler(this.seed)

    const baseObject = compiler.compile(
      this.templates[name].base,
      this.templates[name].options)

    return _.merge(baseObject, attributes)
  }

  /** @private */
  _buildTrait (name, trait, attributes = {}) {
    const compiler = new TemplateCompiler(this.seed)

    const traitObject = compiler.compile(
      _.merge(this.templates[name].base, this.templates[name][trait]),
      this.templates[name].options
    )

    return _.merge(traitObject, attributes)
  }
}

export default ChocolateFactory
