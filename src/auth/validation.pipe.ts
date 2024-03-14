import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { RegisterCredentials } from "./auth.dto";
import { ZodError, ZodSchema } from "zod";


@Injectable()
export class RegistrationValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: any, metadata: ArgumentMetadata): RegisterCredentials {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (e) {
            if (e instanceof ZodError) {
                throw new BadRequestException(e.errors[0].message ?? 'Данные невалидны.');
            }

            throw e;
        }
    }
}


@Injectable()
export class ChangePasswordValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: any) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (e) {
            if (e instanceof ZodError) {
                throw new BadRequestException(e.errors[0].message ?? 'Данные невалидны.');
            }

            throw e;
        }
    }
}