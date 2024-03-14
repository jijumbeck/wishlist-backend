import { z } from "zod";


export const registerCredentialsSchema = z
    .object({
        email: z.string({ required_error: "Email обязательное поле." })
            .email({ message: "Невалидный email." }),
        login: z.string({ required_error: "Логин обязательное поле." }).trim(),
        password: z.string({ required_error: "Пароль обязательное поле." })
            .min(6, { message: "Пароль должен содержать не менее 6 символов." })
    })
    .refine((values) => {
        return values.password !== values.password.toLowerCase();
    }, {
        message: 'Пароль должен содержать заглавные буквы.'
    })
    .refine((values) => {
        return values.password !== values.password.toUpperCase();
    }, {
        message: 'Пароль должен содержать маленькие буквы.'
    })
    .refine((values) => {
        return values.password.match(/\d+/);
    }, {
        message: 'Пароль должен содержать цифру.'
    });


export const passwordSchema = z
    .object({
        newPassword: z.string({ required_error: "Пароль обязательное поле." })
            .min(6, { message: "Пароль должен содержать не менее 6 символов." })
    })
    .refine((values) => {
        return values.newPassword !== values.newPassword.toLowerCase();
    }, {
        message: 'Пароль должен содержать заглавные буквы.'
    })
    .refine((values) => {
        return values.newPassword !== values.newPassword.toUpperCase();
    }, {
        message: 'Пароль должен содержать маленькие буквы.'
    })
    .refine((values) => {
        return values.newPassword.match(/\d+/);
    }, {
        message: 'Пароль должен содержать цифру.'
    });


export function isEmail(input: string) {
    try {
        z.string().email().parse(input);
        return true;
    } catch (e) {
        return false;
    }
}