import {test} from 'tap'
import TemplateCompiler from '../lib/template_compiler'

test('create static objects', g => {
  g.test('creates a shallow static object', t => {
    const template = {
      id: 1,
      name: 'Claire'
    }
    t.same(TemplateCompiler.evaluate(template), template)
    t.end()
  })

  g.test('creates a nested static object', t => {
    const template = {
      id: 1,
      name: 'Claire',
      address: {
        street: 'Sesame street 5'
      }
    }
    t.same(TemplateCompiler.evaluate(template), template)
    t.end()
  })

  g.test('creates a deeply nested static object', t => {
    const template = {
      id: 1,
      name: 'Claire',
      interests: {
        recent: {
          professional: 'painting',
          hobby: 'how should I know'
        }
      }
    }
    t.same(TemplateCompiler.evaluate(template), template)
    t.end()
  })

  g.test('creates a defensive copy of the given object', t => {
    const template = {
      id: 1
    }

    const result = TemplateCompiler.evaluate(template)
    t.same(result.id, 1, `unexpected result ${result.id}`)

    // make sure result cannot be mutated
    template.id = 2
    t.same(result.id, 1, `unexpected result ${result.id}`)
    t.end()
  })

  g.end()
})

test('evaluating functions', g => {
  g.test('evaluates a simple function', t => {
    const template = {
      id: () => 12,
      name: 'Ernesto'
    }
    const result = TemplateCompiler.evaluate(template)
    const expected = {
      id: 12,
      name: 'Ernesto'
    }
    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
    t.end()
  })

  g.test('evaluates nested functions', t => {
    const template = {
      id1: () => 1,
      nested: {
        id2: () => 2,
        nested: {
          id3: () => 3
        }
      }
    }
    const result = TemplateCompiler.evaluate(template)
    const expected = {
      id1: 1,
      nested: {
        id2: 2,
        nested: {
          id3: 3
        }
      }
    }
    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
    t.end()
  })

  g.end()
})
