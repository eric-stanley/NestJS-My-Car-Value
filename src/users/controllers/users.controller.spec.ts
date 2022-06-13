import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    let users: User[] = [];
    fakeUsersService = {
      findOne: (id: number) => {
        const user = users.filter((user) => user.id === id)[0];
        return Promise.resolve(user);
      },
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
      remove: (id: number) => {
        const user = users.filter((user) => user.id === id)[0];

        if (!user) {
          throw new NotFoundException('User not found');
        }

        users = users.filter((user) => user.id !== id);
        return Promise.resolve({} as User);
      },
      update: async (id: number, attrs: Partial<User>) => {
        const user = await fakeUsersService.findOne(id);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        Object.assign(user, attrs);

        return Promise.resolve(user);
      },
    };
    fakeAuthService = {
      signup: async (email: string, password: string) => {
        const users = await fakeUsersService.find(email);
        if (users.length) {
          throw new BadRequestException('Email is already in use');
        }

        return fakeUsersService.create(email, password);
      },
      signin: async (email: string, password: string) => {
        const [user] = await fakeUsersService.find(email);

        if (!user) {
          throw new NotFoundException('User not found');
        }
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    await fakeAuthService.signup('test1@example.com', 'test123');
    const users = await controller.findAllUsers('test1@example.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test1@example.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await fakeAuthService.signup('test1@example.com', 'test123');

    const retrievedUser = await controller.findUser(user.id.toString());
    expect(retrievedUser).toBeDefined();
  });

  it('findUser throws an error if the user with the given id is not found', async () => {
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signup signs up a new user', async () => {
    const session = { userId: -10 };
    const user = await controller.signup(
      { email: 'test1@example.com', password: 'test123' } as CreateUserDto,
      session,
    );
    expect(user.id).toBeDefined();
    expect(session.userId).toBeGreaterThan(0);
  });

  it('signin updates session object and returns user', async () => {
    const user = await fakeAuthService.signup('test1@example.com', 'test123');
    const session = { userId: -10 };
    const retrievedUser = await controller.signin(
      { email: 'test1@example.com', password: 'test123' },
      session,
    );

    expect(retrievedUser.id).toEqual(user.id);
    expect(session.userId).toEqual(user.id);
  });

  it('signout updates session object to null', async () => {
    await fakeAuthService.signup('test1@example.com', 'test123');
    const session = { userId: -10 };
    await controller.signin(
      { email: 'test1@example.com', password: 'test123' },
      session,
    );
    await controller.signout(session);

    expect(session.userId).toBeNull();
  });

  it('whoAmI returns current user', async () => {
    const user = await fakeAuthService.signup('test1@example.com', 'test123');
    const retrievedUser = controller.whoAmI(user);

    expect(retrievedUser).toBeDefined();
  });

  it('remove deletes existing user', async () => {
    let user1 = await fakeAuthService.signup('test1@example.com', 'test123');
    let user2 = await fakeAuthService.signup('test2@example.com', 'test123');
    await controller.removeUser(user2.id.toString());

    user1 = await fakeUsersService.findOne(user1.id);
    user2 = await fakeUsersService.findOne(user2.id);

    expect(user1).toBeDefined();
    expect(user2).toBeUndefined();
  });

  it('update updates existing users email', async () => {
    let user1 = await fakeAuthService.signup('test1@example.com', 'test123');
    const updatedUser = {
      email: 'test2@example.com',
    } as UpdateUserDto;

    user1 = await controller.updateUser(user1.id.toString(), updatedUser);
    expect(user1.email).toEqual('test2@example.com');
  });
});
