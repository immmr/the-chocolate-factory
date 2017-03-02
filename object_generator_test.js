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

  g.test('creates a nested static object', t => {
    const generator = new ObjectGenerator()
    const template = {
      id: 1,
      name: 'Claire',
      address: {
        street: 'Sesame street 5'
      }
    }
    t.same(generator.compile(template), template)
    t.end()
  })

  g.test('creates a deeply nested static object', t => {
    const generator = new ObjectGenerator()
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
    t.same(generator.compile(template), template)
    t.end()
  })
  g.end()
})

test('create dynamic objects', g => {
  g.test('generates an __id__', t => {
    const generator = new ObjectGenerator(1)
    const template = {
      id: '__id__'
    }
    const options = {
      generateId: rand => rand(10)
    }

    const result = generator.compile(template, options)
    t.equal(result.id, '3', `expected 3, got ${result.id}`)
    t.end()
  })

  g.test('generates a __name__', t => {
    const generator = new ObjectGenerator(1)
    const template = {
      name: '__name__'
    }
    const options = {
      generateName: rand => ['Hugo', 'Derya', 'Ashish'][rand(3)]
    }

    const result = generator.compile(template, options)
    t.equal(result.name, 'Derya', `expected 'Derya', got ${result.name}`)
    t.end()
  })

  g.test('compiles a complicated object', t => {
    const generator = new ObjectGenerator(1)
    const template = {
      id: '__id__',
      name: '__name__',
      admin: false,
      access: {
        id: '__id__',
        code: '__name__:__id__',
        token: '__token__'
      }
    }
    const options = {
      generateId: rand => rand(20),
      generateName: rand => ['Frank', 'Sinatra'][rand(2)],
      generateToken: rand => rand(20)
    }
    const result = generator.compile(template, options)
    const expectation = {
      id: 7,
      name: 'Frank',
      admin: false,
      access: {
        id: 7,
        code: 'Frank:7',
        token: 7
      }
    }

    t.same(result, expectation, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()

})
