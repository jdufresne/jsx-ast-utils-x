import type {
  Expression,
  MemberExpression,
  PrivateIdentifier,
  Super,
} from 'estree';

import stringifyExtractedValue from '../stringifyExtractedValue';
import type { ExtractedValue } from '../types';

import extractValueFromCallExpression from './CallExpression';
import extractValueFromThisExpression from './ThisExpression';

interface Parenthesizable {
  extra?: {
    parenthesized?: boolean;
  };
}

interface TSAsExpression {
  type: 'TSAsExpression';
  expression: TSExpression;
}

interface TSNonNullExpression extends Parenthesizable {
  type: 'TSNonNullExpression';
  expression: TSExpression;
}

// Any node reached while walking a `TSNonNullExpression` for an unrecognized
// shape (see the fallback at the end of the extractor).
interface WrappedNode {
  type: string;
  name: string;
  expression?: WrappedNode;
}

type TSExpression =
  | Exclude<Expression, MemberExpression>
  | PrivateIdentifier
  | Super
  | TSAsExpression
  | TSNonNullExpression
  | (MemberExpression & Parenthesizable);

function navigate(
  obj: ExtractedValue,
  prop: ExtractedValue,
  value: MemberExpression,
): string {
  const object = stringifyExtractedValue(obj);
  const property = stringifyExtractedValue(prop);

  if (value.computed) {
    return value.optional
      ? `${object}?.[${property}]`
      : `${object}[${property}]`;
  }
  return value.optional ? `${object}?.${property}` : `${object}.${property}`;
}

/**
 * Extractor function for a TSNonNullExpression type value node. A
 * TSNonNullExpression is accessing a TypeScript Non-Null Assertion Operator !
 *
 * @param value Value - AST Value object with type `TSNonNullExpression`
 * @returns - The extracted value converted to correct type and maintaining
 *   `obj.property` convention.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export default function extractValueFromTSNonNullExpression(
  value: TSExpression,
): ExtractedValue {
  const errorMessage =
    'The prop value with an expression type of TSNonNullExpression could not be resolved. Please file an issue ( https://github.com/jsx-eslint/jsx-ast-utils/issues/new ) to get this fixed immediately.';

  // it's just the name
  if (value.type === 'Identifier') {
    const { name } = value;
    return name;
  }

  if (value.type === 'Literal') {
    return value.value;
  }

  if (value.type === 'TSAsExpression') {
    return extractValueFromTSNonNullExpression(value.expression);
  }

  if (value.type === 'CallExpression') {
    return extractValueFromCallExpression(value);
  }

  if (value.type === 'ThisExpression') {
    return extractValueFromThisExpression();
  }

  // does not contains properties & is not parenthesized
  if (
    value.type === 'TSNonNullExpression' &&
    (!value.extra || value.extra.parenthesized === false)
  ) {
    const { expression } = value;
    return `${stringifyExtractedValue(extractValueFromTSNonNullExpression(expression))}!`;
  }

  // does not contains properties & is parenthesized
  if (
    value.type === 'TSNonNullExpression' &&
    value.extra &&
    value.extra.parenthesized === true
  ) {
    const { expression } = value;
    return `(${stringifyExtractedValue(extractValueFromTSNonNullExpression(expression))}!)`;
  }

  if (value.type === 'MemberExpression') {
    // contains a property & is not parenthesized
    if (!value.extra || value.extra.parenthesized === false) {
      return navigate(
        extractValueFromTSNonNullExpression(value.object),
        extractValueFromTSNonNullExpression(value.property),
        value,
      );
    }

    // contains a property & is parenthesized
    if (value.extra.parenthesized === true) {
      const result = navigate(
        extractValueFromTSNonNullExpression(value.object),
        extractValueFromTSNonNullExpression(value.property),
        value,
      );
      return `(${result})`;
    }
  }

  // try to fail silently, if specs for TSNonNullExpression change
  // not throw, only log error. Similar to how it was done previously
  const { expression: wrapped } = value as { expression?: WrappedNode };
  if (wrapped) {
    let expression: WrappedNode | undefined = wrapped;
    while (expression) {
      if (expression.type === 'Identifier') {
        console.error(errorMessage);
        return expression.name;
      }
      ({ expression } = expression);
    }
  }

  console.error(errorMessage);
  return '';
}
