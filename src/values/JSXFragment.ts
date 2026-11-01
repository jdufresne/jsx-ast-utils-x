import type { JSXFragment } from 'estree-jsx';

import getValue from '.';

/**
 * Extractor function for a JSXFragment type value node.
 *
 * Returns self-closing element with correct name.
 *
 * @param value
 */
export default function extractValueFromJSXFragment(
  value: JSXFragment,
): string {
  if (value.children.length === 0) {
    return '<></>';
  }
  const children = [value.children].flat().map(x => getValue(x));
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- joining extracted values keeps the original coercion
  return `<>${children.join('')}</>`;
}
