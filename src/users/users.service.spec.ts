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

// Assertion helper to validate the structure and hashed password of a user.
const assertValidUser = (
  user: any,
  expected: { email: string; name: string },
  originalPassword: string,
) => {
  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(user.email).toEqual(expected.email);
  expect(user.name).toEqual(expected.name);
  expect(user.createdAt).toBeInstanceOf(Date);
  expect(user.updatedAt).toBeInstanceOf(Date);
  expect(user.password).toBeDefined();
  // Check that the stored password is not the plain text.
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
      // Verify that the fake hash matches our fake implementation.
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
    it('should login a registered user with correct credentials and return a token', async () => {
      const registerPayload = createUserFixture({ email: 'login@example.com', name: 'Login User' });
      const registeredUser = await service.register(registerPayload);

      const loginPayload = createLoginFixture({ email: registerPayload.email, password: registerPayload.password });
      const { userResponse: loggedInUser, token } = await service.login(loginPayload);

      // Validate the logged in user's structure and ensure the IDs match.
      assertValidUser(loggedInUser, { email: registerPayload.email, name: registerPayload.name }, registerPayload.password);
      expect(loggedInUser.id).toEqual(registeredUser.id);
      // Assert that a token is returned and is a string.
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
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
