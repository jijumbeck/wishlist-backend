import { z } from "zod";


export const userShema = z
    .object({
        email: z.string().email({ message: "Невалидный email." }),
        login: z.string(),
        name: z.string(),
        lastName: z.string(),
        birthdate: z.string().date()
    })
    .partial();