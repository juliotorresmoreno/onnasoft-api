import { Test, TestingModule } from '@nestjs/testing';
import { PostTranslationsController } from './post-translations.controller';
import { PostTranslationsService } from './post-translations.service';

describe('PostTranslationsController', () => {
  let controller: PostTranslationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostTranslationsController],
      providers: [PostTranslationsService],
    }).compile();

    controller = module.get<PostTranslationsController>(PostTranslationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
