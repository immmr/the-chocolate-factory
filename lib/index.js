import {assign, cloneDeep, mapValues} from 'lodash'

/**
 * @class
 *
 * @classdesc
 * ChocolateFactory builds objects from templates by copying
 * and replacing functions with their return values. Also provides
 * an afterBuild-hook.
 */
class ChocolateFactory {
  /**
   * Sets up a ChocolateFactory instance
   *
   * @constructor
   *
   * @param {Object} templates - The specifications to be used when
   *   assembling an object
   */
  constructor (templates) {
    // use defensive copying to prevent mutation
    this.templates = cloneDeep(templates)
  }

  /**
   * Wrapper function that delegates creation of objects
   *
   * @param {string} name - The name of the model to construct
   * @param {string=} trait - The variant of the model to construct (optional).
   *   Note: if no trait is given, the second argument will be attributes
   * @param {Object} [attributes={}] - Additional custom attributes to set. Custom
   *   attributes will overwrite even callback-results
   *
   * @returns {Object} object - the compiled object
   */
  build (name, trait, attributes = {}) {
    if (!this.templates[name]) {
      throw new Error(`factory '${name}' is not defined`)
    }

    let model

    // build a base-model or one with a trait
    if (trait && typeof trait === 'string') {
      model = this._buildTrait(name, trait, attributes)
    } else {
      model = this._buildBase(name, trait)
    }

    // call afterBuild-hook if one is defined
    if (this.templates[name].afterBuild) {
      if (typeof this.templates[name].afterBuild !== 'function') {
        throw new Error('Argument Error: afterBuild must be a function')
      }

      this.templates[name].afterBuild(model)
    }

    // merge attributes again cause custom attributes got the last word!
    if (typeof trait === 'string') return assign(model, attributes)
    return assign(model, trait)
  }

  /** @private */
  _buildBase (name, attributes = {}) {
    const baseObject = this._evaluate(this.templates[name].base)

    return assign({}, baseObject, attributes)
  }

  /** @private */
  _buildTrait (name, trait, attributes = {}) {
    if (!this.templates[name][trait]) {
      throw new Error(`unknown trait '${trait}'`)
    }

    if (typeof trait !== 'string') {
      throw new Error('Agrument Error: trait must be a string')
    }

    const traitObject = this._evaluate(
      assign({}, this.templates[name].base, this.templates[name][trait]))

    return assign({}, traitObject, attributes)
  }

  /**
   * Replaces functions on the template with their return-values
   *
   * @private
   *
   * @param {Object} template - A JavaScript object that defines what the
   *   final object should look like. Functions will be invoked.
   *
   * @returns {Object} compiledObject - A copy of the original object
   *   where functions are replaced with values
   */
  _evaluate (template) {
    return this._deepMap(template, value => {
      if (typeof value === 'function') return value()

      return value
    })
  }

  /**
   * maps values except for objects, which are mapped recursively
   *
   * @private
   *
   * @param {Object} object - The object to process
   * @param {function} projection - the function to evaluate on each
   *  leaf-value
   *
   * @returns {Object} - The object where leaf-values are replaced with
   *   results of function-calls
   *
   * NOTE: mutates object!
   */
  _deepMap (object, projection) {
    return mapValues(object, value => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        return this._deepMap(value, projection)
      }

      return projection(value)
    })
  }
}

export default ChocolateFactory
