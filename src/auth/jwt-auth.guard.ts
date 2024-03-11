import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JWTAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const accessToken = request.cookies['accessToken'];
            const user = this.jwtService.verify(accessToken);
            request.user = user;
            return true;
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException({ message: 'Пользователь не авторизован.:((' })
        }
    }
}