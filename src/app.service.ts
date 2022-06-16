import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJS API for calculating car price estimates with authorization and authentication';
  }
}
