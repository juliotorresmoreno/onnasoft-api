import { Injectable } from '@nestjs/common';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';
import { UpdateNewsletterSubscriberDto } from './dto/update-newsletter-subscriber.dto';

@Injectable()
export class NewsletterSubscribersService {
  create(createNewsletterSubscriberDto: CreateNewsletterSubscriberDto) {
    return 'This action adds a new newsletterSubscriber';
  }

  findAll() {
    return `This action returns all newsletterSubscribers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} newsletterSubscriber`;
  }

  update(id: number, updateNewsletterSubscriberDto: UpdateNewsletterSubscriberDto) {
    return `This action updates a #${id} newsletterSubscriber`;
  }

  remove(id: number) {
    return `This action removes a #${id} newsletterSubscriber`;
  }
}
