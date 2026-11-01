import type { BindExpression, MemberExpression } from '@babel/types';

import stringifyExtractedValue from '../stringifyExtractedValue';

import getValue from '.';

/**
 * Extractor function for a BindExpression type value node. A bind expression
 * looks like `::this.foo` This will return `this.foo.bind(this)` as the value
 * to indicate its existence, since we can not execute the function
 * this.foo.bind(this) in a static environment.
 *
 * @param value Value - AST Value object with type `BindExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromBindExpression(
  value: BindExpression,
): string {
  const callee = getValue(value.callee);

  // If value.object === null, the callee must be a MemberExpression.
  // https://github.com/babel/babylon/blob/master/ast/spec.md#bindexpression
  const object =
    value.object === null
      ? getValue((value.callee as MemberExpression).object)
      : getValue(value.object);

  // eslint-disable-next-line sonarjs/in-operator-type-error -- object is an AST node here
  if (value.object && 'property' in value.object) {
    return `${stringifyExtractedValue(object)}.${stringifyExtractedValue(callee)}.bind(${stringifyExtractedValue(object)})`;
  }

  return `${stringifyExtractedValue(callee)}.bind(${stringifyExtractedValue(object)})`;
}
