import type { JSXAttribute } from 'estree-jsx';

import getValue, { getLiteralValue } from './values';
import type { ExtractedValue } from './values/types';

// eslint-disable-next-line sonarjs/function-return-type
function extractValue(
  attribute: unknown,
  extractor: (value: Exclude<JSXAttribute['value'], null>) => ExtractedValue,
): ExtractedValue {
  if (
    typeof attribute !== 'object' ||
    attribute === null ||
    !('type' in attribute) ||
    attribute.type !== 'JSXAttribute'
  ) {
    return undefined;
  }

  const jsxAttribute = attribute as JSXAttribute;

  if (jsxAttribute.value === null) {
    // Null valued attributes imply truthiness.
    // For example: <div aria-hidden />
    // See: https://facebook.github.io/react/docs/jsx-in-depth.html#boolean-attributes
    return true;
  }

  return extractor(jsxAttribute.value);
}

/**
 * Returns the value of a given attribute. Different types of attributes have
 * their associated values in different properties on the object.
 *
 * This function should return the most _closely_ associated value with the
 * intention of the JSX.
 *
 * @param attribute - The JSXAttribute collected by AST parser.
 */
// eslint-disable-next-line sonarjs/function-return-type
export default function getPropValue(attribute: unknown): ExtractedValue {
  return extractValue(attribute, getValue);
}

/**
 * Returns the value of a given attribute. Different types of attributes have
 * their associated values in different properties on the object.
 *
 * This function should return a value only if we can extract a literal value
 * from its attribute (i.e. values that have generic types in JavaScript -
 * strings, numbers, booleans, etc.)
 *
 * @param attribute - The JSXAttribute collected by AST parser.
 */
// eslint-disable-next-line sonarjs/function-return-type
export function getLiteralPropValue(attribute: unknown): ExtractedValue {
  return extractValue(attribute, getLiteralValue);
}
