const _ = require('lodash')

// updates all keys with the result of the projection, operates recursivley
const deepMap = (object, projection) => {
  return _.mapValues(object, value => {
    if (typeof value === 'object') {
      return deepMap(value, projection)
    }

    return projection(value)
  })
}

// replaces number-strings and boolean-strings with numbers and booleans
// note: '+123' will *not* be converted!
const reviveValues = object => {
  return deepMap(object, value => {
    if (typeof value !== 'string') return value

    if (value.charAt(0) === '+') return value

    // try to convert numbers
    if (!Number.isNaN(Number(value))) return Number(value)

    // try to convert booleans
    if (value === 'true') return true
    if (value === 'false') return false

    return value
  })
}

module.exports = {
  deepMap,
  reviveValues
}
