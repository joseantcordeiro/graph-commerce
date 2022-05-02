import { isInt, isDate, isDateTime, isTime, isLocalDateTime, isLocalTime, isDuration } from 'neo4j-driver'

// tag::toNativeTypes[]
/**
 * Convert Neo4j Properties back into JavaScript types
 *
 * @param {Record<string, any>} properties
 * @return {Record<string, any>}
 */
export function toNativeTypes(properties) {
  return Object.fromEntries(Object.keys(properties).map((key) => {
    const value = valueToNativeType(properties[key])

    return [ key, value ]
  }))
}

/**
 * Convert an individual value to its JavaScript equivalent
 *
 * @param {any} value
 * @returns {any}
 */
function valueToNativeType(value) {
  if ( Array.isArray(value) ) {
    value = value.map(innerValue => valueToNativeType(innerValue))
  }
  else if ( isInt(value) ) {
    value = value.toNumber()
  }
  else if (
    isDate(value) ||
    isDateTime(value) ||
    isTime(value) ||
    isLocalDateTime(value) ||
    isLocalTime(value) ||
    isDuration(value)
  ) {
    value = value.toString()
  }
  else if (typeof value === 'object' && value !== undefined  && value !== null) {
    value = toNativeTypes(value)
  }

  return value
}
// end::toNativeTypes[]
