import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/common/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users) private readonly usersModel: typeof Users,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersModel.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
    });

    const plainUser = user.get({ plain: true }) as Record<string, any>;
    delete plainUser.password;
    return plainUser;
  }

  async login(dto: LoginDto) {
    const user = await this.usersModel.findOne({
      where: { email: dto.email },
      raw: true,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      name: user.name,
      email: user.email,
      access_token: token,
    };
  }
}
