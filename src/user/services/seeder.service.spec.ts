import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

describe('SeederService', () => {
  let service: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeederService, { provide: Model, useValue: User }],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
