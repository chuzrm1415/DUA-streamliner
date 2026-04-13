import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates request body/params/query against a Zod schema.
 *
 * Usage:
 *   @Body(new ZodValidationPipe(mySchema)) body: MyDto
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const formatted = (result.error as ZodError).flatten();
      throw new BadRequestException({
        message: 'Validation failed',
        details: formatted.fieldErrors,
      });
    }
    return result.data;
  }
}
