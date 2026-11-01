import type { ObjectExpression, Property, SpreadElement } from 'estree';

import stringifyExtractedValue from '../stringifyExtractedValue';
import type { ExtractedValue } from '../types';

import getValue from '.';

/**
 * Extractor function for an ObjectExpression type value node. An object
 * expression is using {}.
 *
 * @param value Value - AST Value object with type `ObjectExpression`.
 * @returns A representation of the object.
 */
export default function extractValueFromObjectExpression(
  value: ObjectExpression,
): Record<string, ExtractedValue> {
  return value.properties.reduce((obj, property) => {
    // Support types: SpreadProperty and ExperimentalSpreadProperty
    if (/^(?:Experimental)?Spread(?:Property|Element)$/.test(property.type)) {
      const { argument } = property as SpreadElement;
      if (argument.type === 'ObjectExpression') {
        return {
          ...obj,
          ...extractValueFromObjectExpression(argument),
        };
      }
    } else {
      const { key, value: propertyValue } = property as Property;
      return {
        ...obj,
        [stringifyExtractedValue(getValue(key))]: getValue(propertyValue),
      };
    }

    return obj;
  }, {});
}
