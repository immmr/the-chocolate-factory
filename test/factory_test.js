import {test} from 'tap'
import Factory from '../lib/chocolate_factory'

test('creating basic objects', g => {
  g.test('creates a user', t => {
    const templates = {
      user: {
        base: {
          id: 1,
          name: 'Claire'
        }
      }
    }

    const factory = new Factory(templates)
    const result = factory.build('user')

    const expectation = {
      id: 1,
      name: 'Claire'
    }

    t.same(result, expectation, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('creates a message', t => {
    const templates = {
      message: {
        base: {
          id: 1,
          text: 'Say what?'
        }
      }
    }

    const factory = new Factory(templates)
    const result = factory.build('message')

    const expectation = {
      id: 1,
      text: 'Say what?'
    }

    t.same(result, expectation, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()
})

test('creating dynamic objects', g => {
  g.test('replaces id and name', t => {
    const templates = {
      user: {
        base: {
          id: '{{ id }}',
          name: '{{ name }}',
          nested: {
            code: '{{ name }}:ID{{ id }}'
          },
          admin: false
        },
        options: {
          generateId: rand => rand(20),
          generateName: rand => 'Herbert'
        }
      }
    }

    const factory = new Factory(templates, {seed: 1})
    const result = factory.build('user')

    t.equal(result.id, 7, `unexpected result ${result.id}`)
    t.equal(result.name, 'Herbert')
    t.equal(result.nested.code, 'Herbert:ID7', `unexpected ${result}`)
    t.end()
  })

  g.end()
})

test('adding custom attributes', g => {
  g.test('with static objects', t => {
    const templates = {
      user: {
        base: {
          name: 'Lisa Mona',
          address: {
            city: 'Sim City',
            street: 'Sesame street 5'
          }
        }
      }
    }

    const factory = new Factory(templates)
    const result = factory.build('user', {id: 5, address: {city: 'Kong Hong'}})

    t.equal(result.id, 5, `unexpected result ${result.id}`)
    t.equal(result.name, 'Lisa Mona', `unexpected result ${result.name}`)
    t.equal(result.address.city, 'Kong Hong', `unexpected result ${result.name}`)
    t.end()
  })

  g.end()
})

test('building with traits', g => {
  g.test('with statics objects', t => {
    const templates = {
      user: {
        base: {
          name: 'Jo',
          admin: false
        },
        admin: {
          admin: true
        }
      }
    }

    const factory = new Factory(templates)
    const result = factory.build('user', 'admin')

    t.equal(result.admin, true, `unexpected result ${result.admin}`)
    t.end()
  })

  g.test('with dynamic objects and custom attributes', t => {
    const templates = {
      user: {
        base: {
          id: '{{ id }}',
          name: 'Nina',
          admin: false,
          registered: '{{ registered }}'
        },
        admin: {
          admin: true,
          adminId: 'A{{ id }}'
        },
        options: {
          generateId: rand => 4,
          generateRegistered: rand => true
        }
      }
    }

    const factory = new Factory(templates)
    const result = factory.build('user', 'admin', {age: 30})

    t.equal(result.id, 4, `unexpected result ${result.id}`)
    t.equal(result.adminId, 'A4', `unexpected result ${result.adminId}`)
    t.equal(result.admin, true, `unexpected result ${result.admin}`)
    t.equal(result.age, 30, `unexpected result ${result.age}`)
    t.equal(result.registered, true, `unexpected result ${result.registered}`)
    t.end()
  })

  g.end()
})
