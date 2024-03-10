import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { RegisterCredentials } from "./auth.dto";
import { ZodSchema } from "zod";

@Injectable()
export class RegistrationValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: any, metadata: ArgumentMetadata): RegisterCredentials {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (e) {
            const error = e?.[0]?.message;
            throw new BadRequestException(error ?? 'Данные невалидны.');
        }
    }

}