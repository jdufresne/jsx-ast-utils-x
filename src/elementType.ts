import type {
  JSXMemberExpression,
  JSXOpeningElement,
  JSXOpeningFragment,
} from 'estree-jsx';

function resolveMemberExpressions(
  object: JSXMemberExpression['object'] = {} as JSXMemberExpression['object'],
  property: JSXMemberExpression['property'] = {} as JSXMemberExpression['property'],
): string {
  if (object.type === 'JSXMemberExpression') {
    return `${resolveMemberExpressions(object.object, object.property)}.${property.name}`;
  }

  return `${object.name}.${property.name}`;
}

/**
 * Returns the tagName associated with a JSXElement.
 *
 * @param node JSXOpeningElement or JSXOpeningFragment node.
 * @returns The JSX element's tag name.
 */
export default function elementType(
  node: JSXOpeningElement | JSXOpeningFragment = {} as JSXOpeningElement,
): string {
  if (node.type === 'JSXOpeningFragment') {
    return '<>';
  }

  const { name } = node;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- callers may pass a non-JSXElement node
  if (!name) {
    throw new Error('The argument provided is not a JSXElement node.');
  }

  if (name.type === 'JSXMemberExpression') {
    return resolveMemberExpressions(name.object, name.property);
  }

  if (name.type === 'JSXNamespacedName') {
    return `${name.namespace.name}:${name.name.name}`;
  }

  return name.name;
}
