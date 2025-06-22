import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTranslationsController } from './category-translations.controller';
import { CategoryTranslationsService } from './category-translations.service';

describe('CategoryTranslationsController', () => {
  let controller: CategoryTranslationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTranslationsController],
      providers: [CategoryTranslationsService],
    }).compile();

    controller = module.get<CategoryTranslationsController>(CategoryTranslationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
