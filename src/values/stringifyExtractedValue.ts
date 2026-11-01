import type { ExtractedValue } from './types';

/**
 * Converts an extracted value to a string, mirroring JavaScript's own coercion
 * while handling object values explicitly.
 *
 * @param value The extracted value to convert.
 */
export default function stringifyExtractedValue(value: ExtractedValue): string {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value
        .map((item: ExtractedValue) =>
          item === null || item === undefined
            ? ''
            : stringifyExtractedValue(item),
        )
        .join(',');
    }
    return Object.prototype.toString.call(value);
  }
  return String(value);
}
