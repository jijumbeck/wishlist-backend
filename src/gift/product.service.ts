import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import * as cheerio from 'cheerio';
import { ChangeGiftInfoDTO } from "./gift.dto";


interface Content {
    name: string,
    content: string
}


export class ProductService {
    regexes: { title: RegExp; description: RegExp; price: RegExp; currency: RegExp; image: RegExp; };
    constructor() {
        this.regexes = {
            title: /title/i,
            description: /description/i,
            price: /price/i,
            currency: /currency/i,
            image: /image/i
        }
    }

    async getPoductInfo(url: string) {
        const productURL = this.getValidUrl(url);
        const html = await this.getHTML(productURL);
        return this.parseToProduct(html);
    }

    private getValidUrl(url: string) {
        try {
            const productURL = new URL(url);
            return productURL;
        } catch (e) {
            throw new BadRequestException({
                message: 'Невалидный URL.'
            })
        }
    }

    private async getHTML(url: URL) {
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
            'content-type': 'text/html'
        }

        try {
            const response = await axios.get(url.href, { headers });
            const html = response.data as string;

            if (html.match(/captcha/i)) {
                throw new BadRequestException({
                    message: 'Сайт не поделился информацией:(.'
                })
            }

            return html;
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.status === 403) {
                    throw new BadRequestException({
                        message: 'Сайт не поделился информацией:(.'
                    })
                }
            }

            if (e instanceof HttpException) {
                throw e;
            }

            throw new BadRequestException({
                message: 'Что-то пошло не так.'
            })
        }
    }

    private parseToProduct(html: string) {
        const $ = cheerio.load(html);

        const metaWithContent: Content[] = [];
        $('meta').each((index, element) => {
            if (element.type === 'tag') {
                if ((element.attribs?.property || element.attribs?.name) && element.attribs?.content) {
                    metaWithContent.push({
                        name: element.attribs?.property ?? element.attribs?.name,
                        content: element.attribs?.content
                    });
                }
            }
        });

        let productInfo: Content[] = [];

        for (let i = 0; i < metaWithContent.length; ++i) {
            for (let prop in this.regexes) {
                if (metaWithContent[i].name.match(this.regexes?.[prop as keyof (typeof this.regexes)])) {
                    productInfo.push({
                        name: prop,
                        content: metaWithContent[i].content
                    })
                }
            }
        }

        productInfo.push({
            name: 'title',
            content: $('title').text() as string
        })

        const finalProduct: ChangeGiftInfoDTO = {
            title: productInfo.find(element => element.name === 'title')?.content,
            price: Number(productInfo.find(element => element.name === 'price' && !Number.isNaN(Number(element.content)))?.content),
            currency: productInfo.find(element => element.name === 'currency')?.content,
            //description: productInfo.find(element => element.name === 'description')?.content,
            imageURL: productInfo.find(element => {
                let isImage = element.name === 'image';
                if (isImage) {
                    try {
                        new URL(element.content);
                    } catch (e) {
                        return false;
                    }
                }
                return isImage;
            })?.content
        };

        return finalProduct;
    }

}