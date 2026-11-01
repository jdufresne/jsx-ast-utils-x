import type { JSXAttribute, JSXSpreadAttribute } from 'estree-jsx';

import propName from './propName';

const DEFAULT_OPTIONS = {
  spreadStrict: true,
  ignoreCase: true,
};

type Prop = JSXAttribute | JSXSpreadAttribute;

interface HasPropOptions {
  spreadStrict?: boolean;
  ignoreCase?: boolean;
}

/**
 * Returns boolean indicating whether an prop exists on the props property of a
 * JSX element node.
 *
 * @param props
 * @param prop
 * @param options
 */
export default function hasProp(
  props: Prop[] = [],
  prop = '',
  options: HasPropOptions = DEFAULT_OPTIONS,
): boolean {
  const propToCheck = options.ignoreCase ? prop.toUpperCase() : prop;

  return props.some((attribute: Prop) => {
    // If the props contain a spread prop, then refer to strict param.
    if (attribute.type === 'JSXSpreadAttribute') {
      return !options.spreadStrict;
    }

    const currentProp = options.ignoreCase
      ? propName(attribute).toUpperCase()
      : propName(attribute);

    return propToCheck === currentProp;
  });
}

/**
 * Given the props on a node and a list of props to check, this returns a
 * boolean indicating if any of them exist on the node.
 *
 * @param nodeProps
 * @param props
 * @param options
 */
export function hasAnyProp(
  nodeProps: Prop[] = [],
  props: string[] | string = [],
  options: HasPropOptions = DEFAULT_OPTIONS,
): boolean {
  const propsToCheck = typeof props === 'string' ? props.split(' ') : props;

  return propsToCheck.some(prop => hasProp(nodeProps, prop, options));
}

/**
 * Given the props on a node and a list of props to check, this returns a
 * boolean indicating if all of them exist on the node
 *
 * @param nodeProps
 * @param props
 * @param options
 */
export function hasEveryProp(
  nodeProps: Prop[] = [],
  props: string[] | string = [],
  options: HasPropOptions = DEFAULT_OPTIONS,
): boolean {
  const propsToCheck = typeof props === 'string' ? props.split(' ') : props;

  return propsToCheck.every(prop => hasProp(nodeProps, prop, options));
}
