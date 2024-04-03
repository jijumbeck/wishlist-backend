import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

interface UserInToken {
    id: string,
    iat: number,
    exp: number
}

@Injectable()
export class JWTAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const accessToken = request.cookies['accessToken'];
            const user = this.jwtService.verify(accessToken) as UserInToken;
            request.userId = user.id;
            return true;
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException({ message: 'Пользователь не авторизован.:((' })
        }
    }
}