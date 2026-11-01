import type { AssignmentExpression } from 'estree';

import stringifyExtractedValue from '../stringifyExtractedValue';

import getValue from '.';

/**
 * Extractor function for an AssignmentExpression type value node. An assignment
 * expression looks like `x = y` or `x += y` in expression position. This will
 * return the assignment as the value.
 *
 * @param value Value - AST Value object with type `AssignmentExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromAssignmentExpression(
  value: AssignmentExpression,
): string {
  return `${stringifyExtractedValue(getValue(value.left))} ${value.operator} ${stringifyExtractedValue(getValue(value.right))}`;
}
