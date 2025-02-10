import { NextFunction } from 'express';
import { SafeParseError } from 'zod';
import { ErrorMessageOptions, generateErrorMessage, SafeParseSuccess } from 'zod-error';

import { BadRequestError } from '../utils/error.util';

const options: ErrorMessageOptions = {
  delimiter: {
    error: ', ',
    component: ': ',
  },
  path: {
    enabled: true,
    type: 'objectNotation',
    transform: ({ value }) => value,
  },
  code: {
    enabled: false,
  },
  message: {
    enabled: true,
    transform: ({ value }) => value.toLowerCase(),
  },
};

export const validate = <T>(response: SafeParseSuccess<T> | SafeParseError<T>, next: NextFunction) => {
  if (!response.success) {
    const { errors } = response.error;
    const errorMessage = generateErrorMessage(errors, options); // You need to define 'options' or remove it if unnecessary
    throw new BadRequestError(errorMessage);
  }
  next();
};
