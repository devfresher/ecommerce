import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @HttpCode(HttpStatus.OK)
  @Get()
  index() {
    return 'Yes, we are up and running!';
  }
}
