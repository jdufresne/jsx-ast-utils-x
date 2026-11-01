import type { JSXAttribute, JSXElement as JSXElementNode } from 'estree-jsx';

import extractValueFromJSXElement from './JSXElement';
import extractValueFromJSXFragment from './JSXFragment';
import extractValueFromJSXText from './JSXText';
import extractValueFromLiteral from './Literal';
import extract, { extractLiteral } from './expressions';
import type { ExtractedValue } from './types';

type JSXAttributeValue = Exclude<JSXAttribute['value'], null>;

type JSXChild = JSXElementNode['children'][number];

type ValueExtractor = (value: JSXAttributeValue | JSXChild) => ExtractedValue;

// Composition map of types to their extractor functions.
const TYPES: Partial<Record<string, ValueExtractor>> = {
  Literal: extractValueFromLiteral as unknown as ValueExtractor,
  JSXElement: extractValueFromJSXElement as unknown as ValueExtractor,
  JSXExpressionContainer: extract as unknown as ValueExtractor,
  JSXText: extractValueFromJSXText as unknown as ValueExtractor,
  JSXFragment: extractValueFromJSXFragment as unknown as ValueExtractor,
};

// Composition map of types to their extractor functions to handle literals.
const LITERAL_TYPES: Partial<Record<string, ValueExtractor>> = {
  ...TYPES,
  JSXElement: () => null,
  JSXExpressionContainer: extractLiteral as unknown as ValueExtractor,
};

/**
 * This function maps an AST value node to its correct extractor function for
 * its given type.
 *
 * This will map correctly for _all_ possible types.
 *
 * @param value - AST Value object on a JSX Attribute.
 */
// eslint-disable-next-line sonarjs/function-return-type
export default function getValue(
  value: JSXAttributeValue | JSXChild,
): ExtractedValue {
  const extractor = TYPES[value.type];

  if (!extractor) {
    console.log(value.type);
    throw new TypeError(`Cannot extract a value of type ${value.type}`);
  }

  return extractor(value);
}

/**
 * This function maps an AST value node to its correct extractor function for
 * its given type.
 *
 * This will map correctly for _some_ possible types that map to literals.
 *
 * @param value - AST Value object on a JSX Attribute.
 */
// eslint-disable-next-line sonarjs/function-return-type
export function getLiteralValue(value: JSXAttributeValue): ExtractedValue {
  const extractor = LITERAL_TYPES[value.type];

  if (!extractor) {
    throw new TypeError(`Cannot extract a value of type ${value.type}`);
  }

  return extractor(value);
}
