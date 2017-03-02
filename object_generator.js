import rand from 'random-seed'
import {deepMap} from './utils'

class ObjectGenerator {
  constructor (seed) {
    this.seed = seed || rand(10000)
    this.rand = rand.create()
  }

  compile (template, options) {
    return deepMap(template, value => {
      const regEx = /__[^_]+__/g

      if (typeof value === 'string' && value.match(/__[^_]+__/g)) {
        return value.replace(/__[^_]+__/g, subString => {
          // reduce '__id__' to 'id'
          let variable = subString.match(/__(.+)__/)[1]

          // and create full function name like 'generateId'
          let fn = `generate${variable[0].toUpperCase() + variable.slice(1)}`

          // call the function with freshly seeded rand-object
          this.rand.seed(this.seed)
          return options[fn](this.rand)
        })
      }

      return value
    })
  }
}

export default ObjectGenerator

