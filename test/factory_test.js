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

    t.equal(result.id, 6, `unexpected result ${result.id}`)
    t.equal(result.name, 'Herbert')
    t.equal(result.nested.code, 'Herbert:ID6', `unexpected ${result.nested.code}`)
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

  g.test('does not mutate base-templates', t => {
    const templates = {
      user: {
        base: {
          age: 30
        },

        old: {
          age: 80
        }
      }
    }

    const factory = new Factory(templates)
    const user1 = factory.build('user')
    const user2 = factory.build('user', 'old')
    const user3 = factory.build('user')

    t.equal(user1.age, 30, `unexpected result ${user1.age}`)
    t.equal(user2.age, 80, `unexpected result ${user2.age}`)
    t.equal(user3.age, 30, `unexpected result ${user3.age}`)
    t.end()
  })

  g.end()
})

test('building multiple objects', g => {
  g.test('does not use the same seed for subsequent compilers', t => {
    const templates = {
      user: {
        base: {
          id: '{{ id }}'
        },
        options: {
          generateId: rand => rand.string(10)
        }
      }
    }

    const factory = new Factory(templates)
    const user1 = factory.build('user')
    const user2 = factory.build('user')
    const user3 = factory.build('user')
    const user4 = factory.build('user')
    const user5 = factory.build('user')
    const user6 = factory.build('user')

    t.notEqual(user1.id, user2.id, `did not expect equality of ${user1.id}`)
    t.notEqual(user2.id, user3.id, `did not expect equality of ${user2.id}`)
    t.notEqual(user3.id, user4.id, `did not expect equality of ${user3.id}`)
    t.notEqual(user4.id, user5.id, `did not expect equality of ${user4.id}`)
    t.notEqual(user5.id, user6.id, `did not expect equality of ${user5.id}`)
    t.end()
  })

  g.end()
})
