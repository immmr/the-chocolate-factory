import {test} from 'tap'
import ObjectGenerator from './object_generator'

test('create static objects', g => {
  g.test('creates a shallow static object', t => {
    const generator = new ObjectGenerator()
    const template = {
      id: 1,
      name: 'Claire'
    }
    t.same(generator.compile(template), template)
    t.end()
  })

  g.end()
})

