import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductService } from "./product.service";


@ApiTags('Product')
@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) { }

    @Get()
    async getProductInfo(
        @Query() query: { url: string }
    ) {
        console.log(query.url);
        return await this.productService.getPoductInfo(query.url);
    }
}