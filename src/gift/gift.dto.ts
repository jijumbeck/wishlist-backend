
export class ChangeGiftInfoDTO {
    title?: string;
    URL?: string;
    imageURL?: string;
    price?: number;
    currency?: string;
    description?: string;
}

export class AddGiftDTO {
    userId: string;
    wishlistId: string;

    title?: string;
    URL?: string;
    imageURL?: string;
    price?: number;
    currency?: string;
    description?: string;
}