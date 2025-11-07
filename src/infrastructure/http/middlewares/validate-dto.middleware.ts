import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

export const validateDto = <T extends object>(
  dtoClass: ClassConstructor<T>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body as object);

    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((err) => formatError(err)).join(', ');
      return next(new AppError(messages, StatusCodes.BAD_REQUEST));
    }

    req.body = dtoInstance;
    return next();
  };
};

const formatError = (err: ValidationError): string => {
  if (err.constraints) {
    return Object.values(err.constraints)[0];
  }
  if (err.children && err.children.length > 0) {
    return formatError(err.children[0]);
  }
  return 'Validation error';
};
