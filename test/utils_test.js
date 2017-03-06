import {test} from 'tap'

import {deepMap, reviveValues} from '../lib/utils'

test('object with a single value', t => {
  const result = deepMap({id: 2}, value => 2 * value)
  t.same(result, {id: 4}, `expected ${'{id: 4}'}, got ${JSON.stringify(result)}`)
  t.end()
})

test('object with multiple values', t => {
  const result = deepMap({id: 2, name: 'Hannah'}, value => 'x')
  const expectation = {id: 'x', name: 'x'}
  t.same(result, expectation, `expected ${expectation}, got ${JSON.stringify(result)}`)
  t.end()
})

test('deeply nested object', t => {
  const input = {
    x1: 1,
    x2: {
      x3: 3,
      x4: {
        x5: 5,
        x6: {
          x7: 7
        }
      }
    }
  }

  const output = deepMap(input, value => 'x')

  const expectation = {
    x1: 'x',
    x2: {
      x3: 'x',
      x4: {
        x5: 'x',
        x6: {
          x7: 'x'
        }
      }
    }
  }

  t.same(output, expectation, `unexpected output ${output}`)
  t.end()
})

test('does not revive strings starting with +', t => {
  const result = reviveValues({
    id: '123',
    phone: '+123',
    balance: '-123'
  })

  t.type(result.id, 'number', `unexpected type ${typeof result.id}`)
  t.type(result.phone, 'string', `unexpected type ${typeof result.phone}`)
  t.type(result.balance, 'number', `unexpected type ${typeof result.balance}`)
  t.end()
})
