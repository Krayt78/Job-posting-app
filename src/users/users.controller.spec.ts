import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { User } from './model/user.model';
import { UserResponseDto } from './dto/user-response.dto';

// Mock bcrypt methods to speed up tests
beforeAll(() => {
  jest.spyOn(bcrypt, 'hash').mockImplementation(async (password: string, saltRounds: number) => {
    return Promise.resolve(`hashed_${password}`);
  });
  jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hash: string) => {
    return Promise.resolve(hash === `hashed_${password}`);
  });
});

// A default user payload that can be reused and overridden if needed
const defaultUserPayload = {
  email: 'johnDoe@gmail.com',
  password: 'password123',
  name: 'John Doe',
};

// Fixture function: returns a new user payload merged with any overrides
const createUserFixture = (overrides: Partial<typeof defaultUserPayload> = {}) => ({
  ...defaultUserPayload,
  ...overrides,
});

// Assertion helper: verifies that the user object has the expected properties
const assertValidUserResponse = (user: UserResponseDto, expected: { email: string; name: string }) => {
  expect(user).toBeDefined();
  expect(user.id).toBeDefined();
  expect(user.email).toBe(expected.email);
  expect(user.name).toBe(expected.name);
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const payload = createUserFixture();
    const newUser = await controller.register(payload);

    assertValidUserResponse(newUser, { email: payload.email, name: payload.name });
  });

  it('should login a user', async () => {
    const payload = createUserFixture();
    const registeredUser = await controller.register(payload);
    const loginResult = await controller.login({
      email: payload.email,
      password: payload.password,
    });

    const loggedInUser = loginResult.userResponse;
    const token = loginResult.token;
    
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
    assertValidUserResponse(loggedInUser, { email: payload.email, name: payload.name });
    expect(loggedInUser.id).toBe(registeredUser.id);
  });
});
