import { customAlphabet } from 'nanoid';

export const camelize = (text: string): string => {
  const camelizeText = text.toLowerCase().replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  return camelizeText.substring(0, 1).toLowerCase() + camelizeText.substring(1);
};

export const capitalizeFirst = (str: string): string => {
  return str.match('^[a-z]') ? str.charAt(0).toUpperCase() + str.substring(1) : str;
};

export const lowerFirst = (str: string): string => {
  return str.match('^[A-Z]') ? str.charAt(0).toLowerCase() + str.substring(1) : str;
};

export const generateAlphaNumericString = (length: number, prefix = '', suffix: string | number = ''): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const smallLetters = 'abcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length - 1);
  const lastChar = customAlphabet(smallLetters, 1);
  return `${prefix}${nanoid()}${lastChar()}${suffix}`;
};

export const getFullName = (firstName: string | null = '', lastName: string | null = '', alt?: string) => {
  if (!firstName && !lastName) {
    return alt ?? '-';
  }
  return `${firstName} ${lastName}`;
};
