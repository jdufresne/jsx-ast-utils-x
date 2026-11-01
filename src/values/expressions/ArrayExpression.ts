import type { ArrayExpression } from 'estree';

import type { ExtractedValue } from '../types';

import getValue from '.';

/**
 * Extractor function for an ArrayExpression type value node. An array
 * expression is an expression with [] syntax.
 *
 * @param value
 * @returns - An array of the extracted elements.
 */
export default function extractValueFromArrayExpression(
  value: ArrayExpression,
): ExtractedValue[] {
  return value.elements.map(element =>
    element === null ? undefined : getValue(element),
  );
}
