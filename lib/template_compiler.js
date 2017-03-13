import {mapValues} from 'lodash'

/**
 * @class
 */
class TemplateCompiler {
  /**
   * Replaces functions on the template with their return-values
   *
   * @param {Object} template - A JavaScript object that defines what the
   *   final object should look like. Functions will be invoked.
   *
   * @returns {Object} compiledObject - A copy of the original object
   *   where functions are replaced with values
   */
  static evaluate (template) {
    return this._deepMap(template, value => {
      if (typeof value === 'function') return value()

      return value
    })
  }

  /** @private */
  static _deepMap (object, projection) {
    return mapValues(object, value => {
      if (typeof value === 'object') {
        return this._deepMap(value, projection)
      }

      return projection(value)
    })
  }
}

export default TemplateCompiler
