// src/users/users.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

// Mocks for bcrypt to speed up tests
beforeAll(() => {
  jest.spyOn(bcrypt, 'hash').mockImplementation(async (password: string, saltRounds: number) => {
    // Return a fake hash quickly
    return Promise.resolve(`hashed_${password}`);
  });

  jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hash: string) => {
    // Our fake compare: the hash should be "hashed_" concatenated with the password.
    return Promise.resolve(hash === `hashed_${password}`);
  });
});

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

// Assertion helper to validate the structure of a user response (without password)
const assertValidUserResponse = (
  user: any,
  expected: { email: string; name: string },
) => {
  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(user.email).toEqual(expected.email);
  expect(user.name).toEqual(expected.name);
  expect(user.createdAt).toBeInstanceOf(Date);
  expect(user.updatedAt).toBeInstanceOf(Date);
  // IMPORTANT: password should not be returned in the response.
  expect(user.password).toBeUndefined();
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
    it('should register a new user without returning the password', async () => {
      const payload = createUserFixture();
      const registeredUser = await service.register(payload);
      assertValidUserResponse(registeredUser, { email: payload.email, name: payload.name });
    });
  });

  describe('register and login integration', () => {
    it('should register a user and then allow login with the correct password', async () => {
      const payload = createUserFixture({ email: 'integration@example.com', name: 'Integration User' });
      
      // Register the user.
      const registeredUser = await service.register(payload);

      // Now, try to log in with the same credentials.
      const loginPayload = createLoginFixture({ email: payload.email, password: payload.password });
      const { userResponse: loggedInUser, token } = await service.login(loginPayload);

      // Validate the logged-in user's response.
      assertValidUserResponse(loggedInUser, { email: payload.email, name: payload.name });
      expect(loggedInUser.id).toEqual(registeredUser.id);
      // Also ensure a token is returned.
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw an error when logging in with an incorrect password', async () => {
      const payload = createUserFixture({ email: 'wrongpass@example.com', name: 'Wrong Password User' });
      await service.register(payload);

      const loginPayload = createLoginFixture({ email: payload.email, password: 'incorrectPassword' });
      await expect(service.login(loginPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
