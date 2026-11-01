import type {
  Expression as BabelExpression,
  Super as BabelSuper,
} from '@babel/types';
import type { Node } from 'estree';

import JSXElement from '../JSXElement';
import JSXFragment from '../JSXFragment';
import JSXText from '../JSXText';
import Literal from '../Literal';
import type { ExtractedValue } from '../types';

import ArrayExpression from './ArrayExpression';
import AssignmentExpression from './AssignmentExpression';
import BinaryExpression from './BinaryExpression';
import BindExpression from './BindExpression';
import CallExpression from './CallExpression';
import ChainExpression from './ChainExpression';
import ConditionalExpression from './ConditionalExpression';
import FunctionExpression from './FunctionExpression';
import Identifier from './Identifier';
import LogicalExpression from './LogicalExpression';
import MemberExpression from './MemberExpression';
import NewExpression from './NewExpression';
import ObjectExpression from './ObjectExpression';
import OptionalCallExpression from './OptionalCallExpression';
import OptionalMemberExpression from './OptionalMemberExpression';
import SequenceExpression from './SequenceExpression';
import SpreadElement from './SpreadElement';
import TSNonNullExpression from './TSNonNullExpression';
import TaggedTemplateExpression from './TaggedTemplateExpression';
import TemplateLiteral from './TemplateLiteral';
import ThisExpression from './ThisExpression';
import TypeCastExpression from './TypeCastExpression';
import UnaryExpression from './UnaryExpression';
import UpdateExpression from './UpdateExpression';

interface ASTNode {
  type: string;
  expression?: ASTNode | boolean;
  object?: ASTNode;
}

type ExtractableNode = BabelExpression | BabelSuper | Node;

type Extractor = (value: ASTNode) => ExtractedValue;

function extractor(value: (node: never) => ExtractedValue): Extractor {
  return value as Extractor;
}

// Composition map of types to their extractor functions.
const TYPES: Partial<Record<string, Extractor>> = {
  Identifier: extractor(Identifier),
  Literal: extractor(Literal),
  JSXElement: extractor(JSXElement),
  JSXFragment: extractor(JSXFragment),
  JSXText: extractor(JSXText),
  TaggedTemplateExpression: extractor(TaggedTemplateExpression),
  TemplateLiteral: extractor(TemplateLiteral),
  ArrowFunctionExpression: extractor(FunctionExpression),
  FunctionExpression: extractor(FunctionExpression),
  LogicalExpression: extractor(LogicalExpression),
  MemberExpression: extractor(MemberExpression),
  ChainExpression: extractor(ChainExpression),
  OptionalCallExpression: extractor(OptionalCallExpression),
  OptionalMemberExpression: extractor(OptionalMemberExpression),
  CallExpression: extractor(CallExpression),
  UnaryExpression: extractor(UnaryExpression),
  ThisExpression: extractor(ThisExpression),
  ConditionalExpression: extractor(ConditionalExpression),
  BinaryExpression: extractor(BinaryExpression),
  ObjectExpression: extractor(ObjectExpression),
  NewExpression: extractor(NewExpression),
  UpdateExpression: extractor(UpdateExpression),
  ArrayExpression: extractor(ArrayExpression),
  BindExpression: extractor(BindExpression),
  SpreadElement: extractor(SpreadElement),
  TypeCastExpression: extractor(TypeCastExpression),
  SequenceExpression: extractor(SequenceExpression),
  TSNonNullExpression: extractor(TSNonNullExpression),
  AssignmentExpression: extractor(AssignmentExpression),
};

const noop = () => null;

const errorMessage = (expression: string): string =>
  `The prop value with an expression type of ${expression} could not be resolved. Please file an issue ( https://github.com/jsx-eslint/jsx-ast-utils/issues/new ) to get this fixed immediately.`;

/**
 * This function maps an AST value node to its correct extractor function for
 * its given type.
 *
 * This will map correctly for _all_ possible expression types.
 *
 * @param value Value - AST Value object with type `JSXExpressionContainer`
 * @returns The extracted value.
 */
export default function extract(value: ExtractableNode): ExtractedValue {
  let expression: ASTNode;

  const node = value as ASTNode;
  expression =
    typeof node.expression !== 'boolean' && node.expression
      ? node.expression
      : node;

  let { type } = expression;

  // TypeScript NonNull Expression is wrapped and would otherwise end up in
  // the wrong extractor.
  if (expression.object && expression.object.type === 'TSNonNullExpression') {
    type = 'TSNonNullExpression';
  }

  while (type === 'AsExpression' || type === 'TSAsExpression') {
    type = expression.type;

    const nestedExpression = expression.expression;

    if (typeof nestedExpression !== 'object') {
      break;
    }

    expression = nestedExpression;
  }

  const extractValue = TYPES[type];

  if (!extractValue) {
    console.error(errorMessage(type));
    return null;
  }

  return extractValue(expression);
}

// Composition map of types to their extractor functions to handle literals.
const literalExtractor = extractor(Literal);
const identifierExtractor = extractor(Identifier);
const unaryExtractor = extractor(UnaryExpression);
const updateExtractor = extractor(UpdateExpression);
const arrayExtractor = extractor(ArrayExpression);

const LITERAL_TYPES: Partial<Record<string, Extractor>> = {
  ...TYPES,

  // eslint-disable-next-line sonarjs/function-return-type
  Literal: value => {
    const extractedValue = literalExtractor(value);
    return extractedValue === null ? 'null' : extractedValue;
  },

  // eslint-disable-next-line sonarjs/function-return-type
  Identifier: value => {
    const isUndefined = identifierExtractor(value) === undefined;
    return isUndefined ? undefined : null;
  },

  JSXElement: noop,
  JSXFragment: noop,
  JSXText: noop,
  ArrowFunctionExpression: noop,
  FunctionExpression: noop,
  LogicalExpression: noop,
  MemberExpression: noop,
  OptionalCallExpression: noop,
  OptionalMemberExpression: noop,
  CallExpression: noop,

  // eslint-disable-next-line sonarjs/function-return-type
  UnaryExpression: value => {
    const extractedValue = unaryExtractor(value);
    return extractedValue === undefined ? null : extractedValue;
  },

  // eslint-disable-next-line sonarjs/function-return-type
  UpdateExpression: value => {
    const extractedValue = updateExtractor(value);
    return extractedValue === undefined ? null : extractedValue;
  },

  ThisExpression: noop,
  ConditionalExpression: noop,
  BinaryExpression: noop,
  ObjectExpression: noop,
  NewExpression: noop,

  // eslint-disable-next-line sonarjs/function-return-type
  ArrayExpression: value => {
    const extractedValue = arrayExtractor(value);

    return Array.isArray(extractedValue)
      ? extractedValue.filter(item => item !== null)
      : extractedValue;
  },

  BindExpression: noop,
  SpreadElement: noop,
  TSNonNullExpression: noop,
  TSAsExpression: noop,
  TypeCastExpression: noop,
  SequenceExpression: noop,
  ChainExpression: noop,
};

/**
 * This function maps an AST value node to its correct extractor function for
 * its given type.
 *
 * This will map correctly for _some_ possible types that map to literals.
 *
 * @param value Value - AST Value object with type `JSXExpressionContainer`
 * @returns The extracted value.
 */
export function extractLiteral(value: ASTNode): ExtractedValue {
  const expression = (value.expression || value) as ASTNode;

  const extractValue = LITERAL_TYPES[expression.type];

  if (!extractValue) {
    console.error(errorMessage(expression.type));
    return null;
  }

  return extractValue(expression);
}
