import { Test, TestingModule } from '@nestjs/testing';
import { UserSeederService } from './user-seeder.service';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

describe('UserSeederService', () => {
  let service: UserSeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSeederService, { provide: Model, useValue: User }],
    }).compile();

    service = module.get<UserSeederService>(UserSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
