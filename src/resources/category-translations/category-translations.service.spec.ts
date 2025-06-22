import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTranslationsService } from './category-translations.service';

describe('CategoryTranslationsService', () => {
  let service: CategoryTranslationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryTranslationsService],
    }).compile();

    service = module.get<CategoryTranslationsService>(CategoryTranslationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
