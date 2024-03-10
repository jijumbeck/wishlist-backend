import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

export class JWTAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const authHeader = request.headers.authorization;
            const [bearer, token] = authHeader.split(' ');

            if (!bearer || bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException({ message: 'Пользователь не авторизован. Заголовок кривой.' });
            }

            const user = this.jwtService.verify(token);
            request.user = user;
            return true;
        } catch (e) {
            throw new UnauthorizedException({ message: 'Пользователь не авторизован.' })
        }

        return false;
    }

}