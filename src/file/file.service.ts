import { Injectable, InternalServerErrorException } from "@nestjs/common";

import * as path from 'path';
import * as fs from 'fs';


export const enum EntityType {
    userImage = 'userIcon',
    giftImage = 'giftImage'
}


@Injectable()
export class FileService {

    async createFile(type: EntityType, entityId: string, file: Express.Multer.File) {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${entityId}.${fileExtension}`;
            const filePath = path.resolve(__dirname, '..', 'static', type);

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);

            return `${type}/${fileName}`;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }


    async removeFile(type: EntityType, entityId: string) {
        try {

        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}