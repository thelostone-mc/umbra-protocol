/**
 * Utility for finding confusing unicode, sourced from
 * https://www.npmjs.com/package/unicode-confusables
 *
 * used by metamask to detect non ascii chars in ENS names and warn user
 * https://github.com/MetaMask/metamask-extension/blob/2cb807dc20c77390f4d1ec3dbeea6c2c093c792a/ui/ducks/ens.js#L81
 */
const CONFUSABLES = require('../data/confusables.json');

const zeroWidthPoints: Set<string> = new Set([
  '\u200b', // zero width space
  '\u200c', // zero width non-joiner
  '\u200d', // zero width joiner
  '\ufeff', // zero width no-break space
  '\u2028', // line separator
  '\u2029', // paragraph separator,
]);

/**
 * Generates skeleton of the input string after doing a lookup against CONFUSABLES
 * @param {string} sinput_str
 * @returns {string[]}
 */
const makeSkeleton = (input_str: string): string[] => {
  return [...input_str].reduce((acc: string[], point) => {
    if (zeroWidthPoints.has(point)) {
      return acc;
    }
    acc.push(CONFUSABLES[point] || point);
    return acc;
  }, []);
};

/**
 * Detects if string as non ascii characters in string
 * @param {string} input_str
 * @returns {boolean}
 */
export const isConfusing = (input_str: string): boolean => {
  const skeleton = makeSkeleton(input_str);
  const original = [...input_str];
  for (let i = 0, l = skeleton.length; i < l; i++) {
    if (skeleton[i] !== original[i]) return true;
  }

  return false;
};
