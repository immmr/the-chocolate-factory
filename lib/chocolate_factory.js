import _ from 'lodash'

import TemplateCompiler from './template_compiler'

class ChocolateFactory {
  constructor (templates, options = {}) {
    if (options.seed) this.seed = options.seed
    this.templates = templates
  }

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
