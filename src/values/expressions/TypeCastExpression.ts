import type { Node } from 'estree';

import type { ExtractedValue } from '../types';

import getValue from '.';

interface TypeCastExpression {
  expression: Node;
}

/**
 * Extractor function for a TypeCastExpression type value node. A type cast
 * expression looks like `(this.handleClick: (event: MouseEvent) => void))` This
 * will return the expression `this.handleClick`.
 *
 * @param value Value - AST Value object with type `TypeCastExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromTypeCastExpression(
  value: TypeCastExpression,
): ExtractedValue {
  return getValue(value.expression);
}
