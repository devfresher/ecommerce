import { Test, TestingModule } from '@nestjs/testing';
import { ProductSeederService } from './product-seeder.service';

describe('ProductSeederService', () => {
  let service: ProductSeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSeederService],
    }).compile();

    service = module.get<ProductSeederService>(ProductSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
