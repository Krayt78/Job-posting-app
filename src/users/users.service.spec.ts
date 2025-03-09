// src/users/users.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

// Default payload for creating a user.
const defaultUserPayload: CreateUserDto = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

// Fixture: generates a CreateUserDto with default values that can be overridden.
const createUserFixture = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
  ...defaultUserPayload,
  ...overrides,
});

// Fixture: generates a LoginUserDto with default values that can be overridden.
const createLoginFixture = (overrides: Partial<LoginUserDto> = {}): LoginUserDto => ({
  email: defaultUserPayload.email,
  password: defaultUserPayload.password,
  ...overrides,
});

// Assertion helper to validate the structure and hashed password of a user.
const assertValidUser = (user: any, expected: { email: string; name: string }, originalPassword: string) => {
  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(user.email).toEqual(expected.email);
  expect(user.name).toEqual(expected.name);
  expect(user.createdAt).toBeInstanceOf(Date);
  expect(user.updatedAt).toBeInstanceOf(Date);
  expect(user.password).toBeDefined();
  // Ensure that the stored password is not plain text.
  expect(user.password).not.toEqual(originalPassword);
};

describe('UsersService', () => {
  let service: UsersService;

  // Reset the in-memory user store before each test.
  beforeEach(() => {
    service = new UsersService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and hash the password', async () => {
      const payload = createUserFixture();
      const user = await service.register(payload);

      // Validate user object structure.
      assertValidUser(user, { email: payload.email, name: payload.name }, payload.password);
      // Verify that the hash matches the original password.
      const isMatch = await bcrypt.compare(payload.password, user.password);
      expect(isMatch).toBe(true);
    });

    it('should not allow registration with a duplicate email', async () => {
      const payload = createUserFixture({ email: 'duplicate@example.com', name: 'Duplicate User' });
      await service.register(payload);
      await expect(service.register(payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login a registered user with correct credentials', async () => {
      const registerPayload = createUserFixture({ email: 'login@example.com', name: 'Login User' });
      const registeredUser = await service.register(registerPayload);

      const loginPayload = createLoginFixture({ email: registerPayload.email, password: registerPayload.password });
      const loggedInUser = await service.login(loginPayload);

      // Validate the logged in user's structure and ensure the IDs match.
      assertValidUser(loggedInUser, { email: registerPayload.email, name: registerPayload.name }, registerPayload.password);
      expect(loggedInUser.id).toEqual(registeredUser.id);
    });

    it('should throw UnauthorizedException if email is not found', async () => {
      const loginPayload = createLoginFixture({ email: 'nonexistent@example.com' });
      await expect(service.login(loginPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password is incorrect', async () => {
      const registerPayload = createUserFixture({ email: 'wrongpass@example.com', name: 'Wrong Password User' });
      await service.register(registerPayload);

      const loginPayload = createLoginFixture({ email: registerPayload.email, password: 'incorrectPassword' });
      await expect(service.login(loginPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
