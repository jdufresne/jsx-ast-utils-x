import type { JSXAttribute, JSXSpreadAttribute } from 'estree-jsx';

/**
 * Returns the name of the prop given the JSXAttribute object.
 *
 * @param prop
 */
export default function propName(
  prop: JSXAttribute | JSXSpreadAttribute = {} as JSXAttribute,
): string {
  if (prop.type !== 'JSXAttribute') {
    throw new Error(
      'The prop must be a JSXAttribute collected by the AST parser.',
    );
  }

  if (prop.name.type === 'JSXNamespacedName') {
    return `${prop.name.namespace.name}:${prop.name.name.name}`;
  }

  return prop.name.name;
}
