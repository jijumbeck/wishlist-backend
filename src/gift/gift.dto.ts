
export class ChangeGiftInfoDTO {
    title?: string;
    URL?: string;
    imageURL?: string;
    price?: number;
    description?: string;
}

export class AddGiftDTO {
    userId: string;
    wishlistId: string;

    title?: string;
    URL?: string;
    imageURL?: string;
    price?: number;
    description?: string;
}