import type { JSXElement, JSXIdentifier } from 'estree-jsx';

import getValue from '.';

/**
 * Extractor function for a JSXElement type value node.
 *
 * Returns self-closing element with correct name.
 *
 * @param value
 */
export default function extractValueFromJSXElement(value: JSXElement): string {
  // Only plain identifier names are resolved here, as before.
  const Tag = (value.openingElement.name as JSXIdentifier).name;
  if (value.openingElement.selfClosing) {
    return `<${Tag} />`;
  }
  const children = [value.children].flat().map(x => getValue(x));
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- joining extracted values keeps the original coercion
  return `<${Tag}>${children.join('')}</${Tag}>`;
}
