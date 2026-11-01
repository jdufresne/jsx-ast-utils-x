import type { ChainElement, ChainExpression } from 'estree';

import type { ExtractedValue } from '../types';

import getValue from '.';

/**
 * Extractor function for a ChainExpression type value node. A member expression
 * is accessing a property on an object `obj.property`.
 *
 * @param value Value - AST Value object with type `ChainExpression`
 * @returns - The extracted value converted to correct type and maintaining
 *   `obj?.property` convention.
 */
export default function extractValueFromChainExpression(
  value: ChainElement | ChainExpression,
): ExtractedValue {
  const expression =
    value.type === 'ChainExpression' ? value.expression : undefined;
  return getValue(expression || value);
}
