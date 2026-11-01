import type { CallExpression } from 'estree';

import stringifyExtractedValue from '../stringifyExtractedValue';

import getValue from '.';

/**
 * Extractor function for a OptionalCallExpression type value node. A member
 * expression is accessing a property on an object `obj.property` and invoking
 * it.
 *
 * @param value Value - AST Value object with type `OptionalCallExpression`
 * @returns - The extracted value converted to correct type and maintaining
 *   `obj.property?.()` convention.
 */
export default function extractValueFromOptionalCallExpression(
  value: CallExpression,
): string {
  const args = value.arguments.map(x => getValue(x));
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- keeps the original join coercion
  return `${stringifyExtractedValue(getValue(value.callee))}?.(${args.join(', ')})`;
}
