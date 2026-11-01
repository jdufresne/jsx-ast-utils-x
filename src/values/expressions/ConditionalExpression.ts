import type { ConditionalExpression } from 'estree';

import type { ExtractedValue } from '../types';

import getValue from '.';

/**
 * Extractor function for a ConditionalExpression type value node.
 *
 * @param value Value - AST Value object with type `ConditionalExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromConditionalExpression(
  value: ConditionalExpression,
): ExtractedValue {
  const { test, alternate, consequent } = value;

  return getValue(test) ? getValue(consequent) : getValue(alternate);
}
