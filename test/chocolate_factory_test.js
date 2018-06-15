import {test} from 'tap'
import Factory from '../lib'

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

    const expected = {
      id: 1,
      name: 'Claire'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
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

    const expected = {
      id: 1,
      text: 'Say what?'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('works with a defensive copy of the template', t => {
    const templates = {
      user: {
        base: {
          name: 'Foucault'
        }
      }
    }
    const factory = new Factory(templates)
    templates.user.base.name = 'Derrida'
    const result = factory.build('user')

    const expected = {
      name: 'Foucault'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('throws an error if factory is not defined', t => {
    const factory = new Factory({})
    t.throws(() => factory.build('user'), new Error('not defined'))
    t.end()
  })

  g.end()
})

test('setting dependent properties', g => {
  g.test('adds a property dynamically', t => {
    const templates = {
      user: {
        base: {
          id: () => 14,
          name: 'Merleau-Ponty'
        },

        afterBuild: user => {
          user.token = `::${user.id}::`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user')

    const expected = {
      id: 14,
      name: 'Merleau-Ponty',
      token: '::14::'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('overwrites an existing property', t => {
    const templates = {
      user: {
        base: {
          id: () => 14,
          name: 'Merleau-Ponty'
        },

        afterBuild: user => {
          user.id = `::${user.id}::`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user')

    const expected = {
      id: '::14::',
      name: 'Merleau-Ponty'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('works with different levels of nesting', t => {
    const templates = {
      user: {
        base: {
          id1: 1,
          nested: {
            id2: 2,
            nested: {
              id3: 3
            }
          }
        },

        afterBuild: user => {
          user.id1 = `__${user.id1}__`
          user.nested.id2 = `__${user.nested.id2}__`
          user.nested.nested.id3 = `__${user.nested.nested.id3}__`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user')

    const expected = {
      id1: '__1__',
      nested: {
        id2: '__2__',
        nested: {
          id3: '__3__'
        }
      }
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('throws an error if callback is not a function', t => {
    const templates = {
      user: {
        base: {
          name: 'Herkues'
        },

        afterBuild: 'not a function'
      }
    }
    const factory = new Factory(templates)

    t.throws(() => factory.build('user'), new Error('Argument Error'), 'throws up')
    t.end()
  })

  g.end()
})

test('building objects with traits', g => {
  g.test('adds a trait-property', t => {
    const templates = {
      user: {
        base: {
          name: 'Ashish',
          admin: false
        },
        admin: {
          admin: true
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user', 'admin')

    const expected = {
      name: 'Ashish',
      admin: true
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('does not mutate the base object', t => {
    const templates = {
      user: {
        base: {
          name: 'Flora'
        },
        trait: {
          name: 'Fauna'
        }
      }
    }
    const factory = new Factory(templates)

    const result1 = factory.build('user')
    t.equal(result1.name, 'Flora')

    const result2 = factory.build('user', 'trait')
    t.equal(result2.name, 'Fauna')

    const result3 = factory.build('user')
    t.equal(result3.name, 'Flora')

    t.end()
  })

  g.test('works with dependent properties', t => {
    const templates = {
      user: {
        base: {
          name: 'Ashish',
          admin: false
        },
        admin: {
          admin: true
        },
        afterBuild: user => {
          user.notAdmin = !user.admin
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user', 'admin')

    const expected = {
      name: 'Ashish',
      admin: true,
      notAdmin: false
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()
})

test('with custom properties', g => {
  g.test('adds a property', t => {
    const templates = {
      movie: {
        base: {
          title: 'Tokyo Story'
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('movie', {
      title: 'Seven Samurai'
    })

    const expected = {
      title: 'Seven Samurai'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('is available to dependent properties', t => {
    const templates = {
      movie: {
        base: {
          title: 'Enter the Dragon'
        },
        afterBuild: movie => {
          movie.titleCopy = `${movie.title}`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('movie', {
      title: 'Seven Samurai'
    })

    const expected = {
      title: 'Seven Samurai',
      titleCopy: 'Seven Samurai'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('overwrites trait-properties', t => {
    const templates = {
      movie: {
        base: {
          title: 'Shortbus'
        },
        longMovie: {
          duration: '400min'
        },
        afterBuild: movie => {
          movie.titleCopy = `${movie.title}`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('movie', 'longMovie', {
      title: 'Love Exposure'
    })

    const expected = {
      title: 'Love Exposure',
      duration: '400min',
      titleCopy: 'Love Exposure'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('overwrites dependent-properties', t => {
    const templates = {
      user: {
        base: {},
        afterBuild: user => {
          user.name = 'Alice in Wonderland'
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user', {
      name: 'Alice Miller'
    })

    const expected = {
      name: 'Alice Miller'
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()
})

test('#_evaluate', g => {
  g.test('creates a shallow static object', t => {
    const template = {
      id: 1,
      name: 'Claire'
    }
    t.same(new Factory()._evaluate(template), template)
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
    t.same(new Factory()._evaluate(template), template)
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
    t.same(new Factory()._evaluate(template), template)
    t.end()
  })

  g.test('creates a defensive copy of the given object', t => {
    const template = {
      id: 1
    }

    const result = new Factory()._evaluate(template)
    t.same(result.id, 1, `unexpected result ${result.id}`)

    // make sure result cannot be mutated
    template.id = 2
    t.same(result.id, 1, `unexpected result ${result.id}`)
    t.end()
  })

  g.test('evaluates a simple function', t => {
    const template = {
      id: () => 12,
      name: 'Ernesto'
    }
    const result = new Factory()._evaluate(template)
    const expected = {
      id: 12,
      name: 'Ernesto'
    }
    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
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
    const result = new Factory()._evaluate(template)
    const expected = {
      id1: 1,
      nested: {
        id2: 2,
        nested: {
          id3: 3
        }
      }
    }
    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()
})

test('allowing arrays as keys', g => {
  g.test('works on a single property', t => {
    const templates = {
      collection: {
        base: { values: [1, 2, 3] }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('collection')

    const expected = { values: [1, 2, 3] }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.type(result.values, 'Array', 'should have type array')
    t.end()
  })

  g.test('works with nesting', t => {
    const templates = {
      collection: {
        base: {
          level2: { values2: [4, 5, 6] }
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('collection')

    const expected = {
      level2: { values2: [4, 5, 6] }
    }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.type(result.level2.values2, 'Array', 'should have type array')
    t.end()
  })

  g.test('works with traits', t => {
    const templates = {
      collection: {
        even: { values: [2, 4, 6] }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('collection', 'even')
    const expected = { values: [2, 4, 6] }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.type(result.values, 'Array', 'should have type array')
    t.end()
  })

  g.test('works with overrides', t => {
    const templates = {
      collection: {
        values: ['a', 'b', 'c']
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('collection', {
      values: ['x']
    })
    const expected = { values: ['x'] }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.test('works with overriding return values', t => {
    const templates = {
      collection: {
        values: () => ['a', 'b', 'c']
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('collection', {
      values: ['x']
    })
    const expected = { values: ['x'] }

    t.same(result, expected, `unexpected result ${JSON.stringify(result)}`)
    t.end()
  })

  g.end()
})
