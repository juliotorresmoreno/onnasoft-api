import { Module } from '@nestjs/common';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';
import { NewsletterSubscribersController } from './newsletter-subscribers.controller';

@Module({
  controllers: [NewsletterSubscribersController],
  providers: [NewsletterSubscribersService],
})
export class NewsletterSubscribersModule {}
