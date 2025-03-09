// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './model/user.model';
import * as jwt from 'jsonwebtoken';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private readonly jwtSecret = 'your_jwt_secret'; // Replace with env variable in production

  // Helper method to hash a password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 100;
    return bcrypt.hash(password, saltRounds);
  }

  // Helper method to remove the password from the user object
  private toResponse(user: User): UserResponseDto {
    const { password, ...rest } = user;
    return rest;
  }

  // Register a new user: hash the password before saving the user.
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = this.users.find(u => u.email === createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser: User = {
      id: uuidv4(),
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Todo: add the "send email to verify email" logic here

    this.users.push(newUser);
    return this.toResponse(newUser);
  }

  // Helper method to generate an authentication token for a user
  private generateAuthToken(user: User): string {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
  }

  // Login method: compare provided password with the stored hashed password.
  // Returns both the authenticated user and an auth token.
  async login(loginUserDto: LoginUserDto): Promise<{ userResponse: UserResponseDto; token: string }> {
    const user = this.users.find(u => u.email === loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateAuthToken(user);
    const userResponse = this.toResponse(user);
    return { userResponse, token };
  }

  // Additional CRUD methods could go here (find, update, delete, etc.)
}
