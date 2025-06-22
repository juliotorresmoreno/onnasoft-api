import { Test, TestingModule } from '@nestjs/testing';
import { PostTranslationsService } from './post-translations.service';

describe('PostTranslationsService', () => {
  let service: PostTranslationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostTranslationsService],
    }).compile();

    service = module.get<PostTranslationsService>(PostTranslationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
