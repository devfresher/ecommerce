import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock User Model
const mockUserModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  startSession: jest.fn(),
};

// Mock User Data
const mockUser = {
  _id: 'some-id',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  isBanned: false,
};

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return a list of users', async () => {
      mockUserModel.find.mockResolvedValue([mockUser]);

      const result = await service.getAll({}, {});
      expect(result).toEqual([mockUser]);
    });

    it('should return a filtered list of users', async () => {
      mockUserModel.find.mockResolvedValue([mockUser]);

      const result = await service.getAll({ limit: 10, page: 1 }, { search: 'Test' });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const dto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      const hashedPassword = 'hashedPassword123';

      const mockBcrypt = {
        hash: jest.fn().mockResolvedValue(hashedPassword),
      };

      mockUserModel.create.mockImplementation((data) => {
        const hashedPassword = mockBcrypt.hash(data.password);
        return Promise.resolve({ ...mockUser, ...dto, password: hashedPassword });
      });

      const result = await service.create(dto);
      expect(result).toEqual({ ...mockUser, ...dto, password: hashedPassword });
    });

    it('should throw a ConflictException if the user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('toggleBan', () => {
    it('should toggle the ban status of a user', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      // Mocking session
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mockUserModel.startSession.mockResolvedValue(mockSession);

      const result = await service.toggleBan(mockUser._id);
      expect(result.isBanned).toBe(!mockUser.isBanned);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction if there is an error', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mockUserModel.startSession.mockResolvedValue(mockSession);

      // Simulate an error
      jest.spyOn(service, 'getOrError').mockRejectedValueOnce(new Error('Test Error'));

      await expect(service.toggleBan(mockUser._id)).rejects.toThrow('Test Error');
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});
