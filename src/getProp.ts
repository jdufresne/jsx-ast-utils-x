import type {
  Expression,
  Literal,
  Node,
  Pattern,
  Property,
  SpreadElement,
} from 'estree';
import type { JSXAttribute, JSXSpreadAttribute } from 'estree-jsx';

import propName from './propName';

type JSXProp = JSXAttribute | JSXSpreadAttribute;

interface RangedNode {
  range?: [number, number] | undefined;
  start?: number | undefined;
  end?: number | undefined;
}

interface BaseLocation {
  start: NonNullable<Node['loc']>['start'];
  end: NonNullable<Node['loc']>['end'];
  source?: string | null | undefined;
  filename?: string | undefined;
}

const DEFAULT_OPTIONS = {
  ignoreCase: true,
};

interface GetPropOptions {
  ignoreCase?: boolean;
}

/**
 * Returns the JSXAttribute itself or undefined, indicating the prop is not
 * present on the JSXOpeningElement.
 *
 * @param props
 * @param prop
 * @param options
 */
// eslint-disable-next-line sonarjs/function-return-type -- Absence is represented by undefined.
export default function getProp(
  props: JSXProp[] = [],
  prop = '',
  options: GetPropOptions = DEFAULT_OPTIONS,
): JSXAttribute | undefined {
  function getName(name: string): string {
    return options.ignoreCase ? name.toUpperCase() : name;
  }
  const propToFind = getName(prop);
  function isPropToFind(property: Property | SpreadElement): boolean {
    return (
      property.type === 'Property' &&
      property.key.type === 'Identifier' &&
      propToFind === getName(property.key.name)
    );
  }

  const foundAttribute = props.find(
    (attribute: JSXAttribute | JSXSpreadAttribute): boolean => {
      // If the props contain a spread prop, try to find the property in the object expression.
      if (attribute.type === 'JSXSpreadAttribute') {
        return (
          attribute.argument.type === 'ObjectExpression' &&
          propToFind !== getName('key') && // https://github.com/reactjs/rfcs/pull/107
          attribute.argument.properties.some(isPropToFind)
        );
      }

      return propToFind === getName(propName(attribute));
    },
  );

  if (foundAttribute && foundAttribute.type === 'JSXSpreadAttribute') {
    const argument = foundAttribute.argument;

    if (argument.type !== 'ObjectExpression') {
      return undefined;
    }

    const property = argument.properties.find(isPropToFind);

    if (!property || property.type !== 'Property') {
      return undefined;
    }

    return propertyToJSXAttribute(property);
  }

  return foundAttribute;
}

function propertyToJSXAttribute(node: Property): JSXAttribute {
  if (node.key.type !== 'Identifier') {
    throw new Error('Expected an object property with an identifier key.');
  }

  const { key, value } = node;

  return {
    type: 'JSXAttribute',
    name: {
      type: 'JSXIdentifier',
      name: key.name,
      ...getBaseProps(key),
    },
    value:
      value.type === 'Literal'
        ? (adjustRangeOfNode(value) as Literal)
        : {
            type: 'JSXExpressionContainer',
            expression: adjustExpressionRange(value),
            ...getBaseProps(value),
          },
    ...getBaseProps(node),
  };
}

function adjustRangeOfNode<T extends RangedNode>(
  node: T,
): Omit<T, 'end' | 'start'> & {
  start: undefined;
  end: undefined;
  range: [number, number];
} {
  const [start, end] = node.range || [node.start, node.end];

  return {
    ...node,
    end: undefined,
    range: [start, end] as [number, number],
    start: undefined,
  };
}

function adjustExpressionRange(expression: Expression | Pattern): Expression {
  const { expressions, quasis, ...rest } = expression as Expression & {
    expressions?: RangedNode[];
    quasis?: RangedNode[];
  };

  return {
    ...adjustRangeOfNode(rest as Expression & RangedNode),
    ...(expressions
      ? {
          expressions: expressions.map(item => adjustRangeOfNode(item)),
        }
      : {}),
    ...(quasis
      ? {
          quasis: quasis.map(item => adjustRangeOfNode(item)),
        }
      : {}),
  } as Expression;
}

function getBaseProps(node: Node): {
  loc: BaseLocation | undefined;
  range: [number, number];
} {
  const { loc, ...rest } = node;
  const { range } = adjustRangeOfNode(rest as RangedNode);

  return {
    loc: loc ? getBaseLocation(loc) : undefined,
    range,
  };
}

function getBaseLocation(
  location: NonNullable<Node['loc']> & { filename?: string },
): BaseLocation {
  const { start, end, source, filename } = location;
  return {
    start,
    end,
    ...(source === undefined ? {} : { source }),
    ...(filename === undefined ? {} : { filename }),
  };
}
