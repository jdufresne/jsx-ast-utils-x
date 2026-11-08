/**
 * Returns the name of the prop given the JSXAttribute object.
 *
 * @param prop
 */
export default function propName(prop) {
  if (prop.name.type === 'JSXNamespacedName') {
    return `${prop.name.namespace.name}:${prop.name.name.name}`;
  }

  return prop.name.name;
}
