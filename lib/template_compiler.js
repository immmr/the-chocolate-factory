import rand from 'random-seed'
import {deepMap, reviveValues} from './utils'

class TemplateCompiler {
  constructor (seed) {
    this.seed = seed || new Date().getTime()
    this.rand = rand.create()
  }

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

        this.rand.seed(this.seed)
        return options[fn](this.rand)
      })
    }))
  }
}

export default TemplateCompiler

