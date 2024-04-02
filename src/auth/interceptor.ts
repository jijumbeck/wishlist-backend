import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";


@Injectable()
export class UserInteceptor implements NestInterceptor {
    constructor(private jwtService: JwtService) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        try {
            const accessToken = request.cookies['accessToken'];

            if (accessToken) {
                const user = this.jwtService.verify(accessToken);
                request.userId = user.id;
            } else {
                request.userId = null;
            }

            return next.handle()
        } catch (e) {
            console.log(e);
        }
    }
}