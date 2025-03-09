// src/users/users.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './model/user.model';

@Injectable()
export class UsersService {
  private users: User[] = [];

  // Helper method to hash a password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 100;
    return bcrypt.hash(password, saltRounds);
  }

  // Register a new user: hash the password before saving the user.
  async register(createUserDto: CreateUserDto): Promise<User> {
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

    //Todo: add the whole "send email to verify email" logic here

    this.users.push(newUser);
    return newUser;
  }

  // Login method: compare provided password with the stored hashed password.
  // this method could be more secure by making sure someone can't brute force
  // could implement some type of waiting to offuscate the time it takes to verify
  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = this.users.find(u => u.email === loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // Additional CRUD methods could go here (find, update, delete, etc.)
}
