import type { Expression, TemplateElement, TemplateLiteral } from 'estree';

// Parsers provide either `range` or `start` (e.g. Babel) for source positions.
type TemplatePartition = { start?: number } & (Expression | TemplateElement);

function getStart(node: TemplatePartition): number {
  return node.range ? node.range[0] : (node.start as number);
}

function sortStarts(a: TemplatePartition, b: TemplatePartition): number {
  return getStart(a) - getStart(b);
}

/**
 * Returns the string value of a template literal object. Tries to build it as
 * best as it can based on the passed prop. For instance `This is a ${prop}`
 * will return 'This is a {prop}'.
 *
 * If the template literal builds to undefined (`${undefined}`), then this
 * should return "undefined".
 *
 * @param value
 * @returns The extracted template literal value.
 */
export default function extractValueFromTemplateLiteral(
  value: TemplateLiteral,
): string {
  const { quasis, expressions } = value;
  const partitions: TemplatePartition[] = [...quasis, ...expressions];

  partitions.sort(sortStarts);

  return partitions
    .map(partition => {
      if (partition.type === 'TemplateElement') {
        return partition.value.raw;
      }

      if (partition.type === 'Identifier') {
        return partition.name === 'undefined'
          ? partition.name
          : `{${partition.name}}`;
      }

      if (partition.type.includes('Expression')) {
        return `{${partition.type}}`;
      }

      return '';
    })
    .join('');
}
