import type { BinaryExpression } from 'estree';

import getValue from '.';

type BinaryResult = bigint | boolean | number | string | undefined;

/**
 * Extractor function for a BinaryExpression type value node. A binary
 * expression has a left and right side separated by an operator such as `a +
 * b`.
 *
 * @param value Value - AST Value object with type `BinaryExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromBinaryExpression(
  value: BinaryExpression,
): BinaryResult {
  const { operator, left, right } = value;
  const leftVal = getValue(left);
  const rightVal = getValue(right);
  const leftNum = leftVal as number;
  const rightNum = rightVal as number;

  switch (operator) {
    case '==': {
      return leftVal == rightVal;
    }
    case '!=': {
      return leftVal != rightVal;
    }
    case '===': {
      return leftVal === rightVal;
    }
    case '!==': {
      return leftVal !== rightVal;
    }
    case '<': {
      return leftNum < rightNum;
    }
    case '<=': {
      return leftNum <= rightNum;
    }
    case '>': {
      return leftNum > rightNum;
    }
    case '>=': {
      return leftNum >= rightNum;
    }
    case '<<': {
      return leftNum << rightNum;
    }
    case '>>': {
      return leftNum >> rightNum;
    }
    case '>>>': {
      return leftNum >>> rightNum;
    }
    case '+': {
      return leftNum + rightNum;
    }
    case '-': {
      return leftNum - rightNum;
    }
    case '*': {
      return leftNum * rightNum;
    }
    case '/': {
      return leftNum / rightNum;
    }
    case '%': {
      return leftNum % rightNum;
    }
    case '|': {
      return leftNum | rightNum;
    }
    case '^': {
      return leftNum ^ rightNum;
    }
    case '&': {
      return leftNum & rightNum;
    }
    case 'in': {
      try {
        return (leftVal as string) in (rightVal as object);
      } catch {
        return false;
      }
    }
    case 'instanceof': {
      if (typeof rightVal !== 'function') {
        return false;
      }
      return (leftVal as object) instanceof rightVal;
    }
    default: {
      return;
    }
  }
}
