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

    const expected = {
      id: 1,
      name: 'Claire'
    }

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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
          user.token = `::${ user.id }::`
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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
          user.id = `::${ user.id }::`
        }
      }
    }
    const factory = new Factory(templates)
    const result = factory.build('user')

    const expected = {
      id: '::14::',
      name: 'Merleau-Ponty'
    }

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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
          user.id1 = `__${ user.id1 }__`
          user.nested.id2 = `__${ user.nested.id2 }__`
          user.nested.nested.id3 = `__${ user.nested.nested.id3 }__`
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
    t.end()
  })

  g.test('is available to dependent properties', t => {
    const templates = {
      movie: {
        base: {
          title: 'Enter the Dragon'
        },
        afterBuild: movie => {
          movie.titleCopy = `${ movie.title }`
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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
          movie.titleCopy = `${ movie.title }`
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
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

    t.same(result, expected, `unexpected result ${ JSON.stringify(result) }`)
    t.end()
  })

  g.end()
})

test('A big and complex example', t => {
  t.end()
})
