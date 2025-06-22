import { PartialType } from '@nestjs/swagger';
import { CreateNewsletterSubscriberDto } from './create-newsletter-subscriber.dto';

export class UpdateNewsletterSubscriberDto extends PartialType(CreateNewsletterSubscriberDto) {}
