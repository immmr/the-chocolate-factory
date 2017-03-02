import {test} from 'tap'
import TemplateCompiler from '../lib/template_compiler'

test('create static objects', g => {
  g.test('creates a shallow static object', t => {
    const compiler = new TemplateCompiler()
    const template = {
      id: 1,
      name: 'Claire'
    }
    t.same(compiler.compile(template), template)
    t.end()
  })

  g.test('creates a nested static object', t => {
    const compiler = new TemplateCompiler()
    const template = {
      id: 1,
      name: 'Claire',
      address: {
        street: 'Sesame street 5'
      }
    }
    t.same(compiler.compile(template), template)
    t.end()
  })

  g.test('creates a deeply nested static object', t => {
    const compiler = new TemplateCompiler()
    const template = {
      id: 1,
      name: 'Claire',
      interests: {
        recent: {
          professional: 'painting',
          hobby: 'nothing really'
        }
      }
    }
    t.same(compiler.compile(template), template)
    t.end()
  })

  g.test('creates a defensive copy of the given object', t => {
    const compiler = new TemplateCompiler()
    const template = {
      id: 1
    }

    const result = compiler.compile(template)
    t.same(result.id, 1, `unexpected result ${result.id}`)

    // make sure result cannot be mutated
    template.id = 2
    t.same(result.id, 1, `unexpected result ${result.id}`)
    t.end()
  })

  g.end()
})

test('create dynamic objects', g => {
  g.test('generates an {{ id }}', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      id: '{{ id }}'
    }
    const options = {
      generateId: rand => rand(10)
    }

    const result = compiler.compile(template, options)
    t.equal(result.id, 3, `expected 3, got ${result.id}`)
    t.end()
  })

  g.test('generates a {{ name }}', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      name: '{{ name }}'
    }
    const options = {
      generateName: rand => ['Hugo', 'Derya', 'Ashish'][rand(3)]
    }

    const result = compiler.compile(template, options)
    t.equal(result.name, 'Derya', `unexpected result ${result.name}`)
    t.end()
  })

  g.test('can deal with different whitespaces', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      name1: '{{  name }}',
      name2: '{{name  }}',
      name3: '{{ name}}',
      name4: '{{name}}'
    }
    const options = {
      generateName: rand => ['Hugo', 'Claire', 'Ashish'][rand(3)]
    }

    const result = compiler.compile(template, options)
    t.equal(result.name1, 'Claire', `unexpected result ${result.name1}`)
    t.equal(result.name2, 'Claire', `unexpected result ${result.name2}`)
    t.equal(result.name3, 'Claire', `unexpected result ${result.name3}`)
    t.equal(result.name4, 'Claire', `unexpected result ${result.name4}`)
    t.end()
  })

  g.test('compiles a complicated object', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      id: '{{ id }}',
      name: '{{ name }}',
      admin: false,
      access: {
        id: '{{ id }}',
        code: '{{ name }}:{{ id }}',
        token: '{{ token }}'
      }
    }
    const options = {
      generateId: rand => rand(20),
      generateName: rand => ['Frank', 'Sinatra'][rand(2)],
      generateToken: rand => rand(20)
    }
    const result = compiler.compile(template, options)
    const expectation = {
      id: 6,
      name: 'Frank',
      admin: false,
      access: {
        id: 6,
        code: 'Frank:6',
        token: 8
      }
    }

    t.same(result, expectation, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('generates different results for different keys', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      id1: '{{ id1 }}',
      id2: '{{ id2 }}'
    }

    const options = {
      generateId1: rand => rand(100),
      generateId2: rand => rand(100)
    }

    const result = compiler.compile(template, options)

    t.notEqual(result.id1, result.id2, 'ids should be different')
    t.end()
  })

  g.test('throws an error if interpolation is attemped w/o options', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      id: '{{ id }}'
    }

    t.throws(() => compiler.compile(template), new Error('missing argument'))
    t.end()
  })

  g.test('throws an error if callback-function is missing', t => {
    const compiler = new TemplateCompiler(1)
    const template = {
      id: '{{ id }}'
    }

    t.throws(() => compiler.compile(template, {}), new Error('could not find'))
    t.end()
  })

  g.end()
})
