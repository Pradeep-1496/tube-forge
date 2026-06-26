import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { User } from 'src/common/models/user.model';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly usersModel: typeof User,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    try {
      const decoded = this.jwtService.decode<{ email?: string }>(token);

      if (!decoded || !decoded.email) {
        throw new ForbiddenException('Invalid token');
      }

      const user = await this.usersModel.findOne({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const plainUser = user.get({ plain: true }) as unknown as UserPlain;
      request.user = plainUser as unknown as Record<string, string>;

      if (!requiredRoles.includes(plainUser.role)) {
        throw new ForbiddenException('Access denied: insufficient permissions');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Token validation failed');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
