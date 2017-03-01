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

module.exports = {deepMap}
