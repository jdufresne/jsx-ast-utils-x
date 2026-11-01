import type { SimpleCallExpression } from 'estree';

import stringifyExtractedValue from '../stringifyExtractedValue';

import getValue from '.';

/**
 * Extractor function for a CallExpression type value node. A call expression
 * looks like `bar()` This will return `bar` as the value to indicate its
 * existence, since we can not execute the function bar in a static
 * environment.
 *
 * @param value Value - AST Value object with type `CallExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromCallExpression(
  value: SimpleCallExpression,
): string {
  const args = Array.isArray(value.arguments)
    ? // eslint-disable-next-line @typescript-eslint/no-base-to-string -- keeps the original join coercion
      value.arguments.map(x => getValue(x)).join(', ')
    : '';
  return `${stringifyExtractedValue(getValue(value.callee))}${value.optional ? '?.' : ''}(${args})`;
}
