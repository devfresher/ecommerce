import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  /**
   * Simple health check to verify if the application is up and running.
   */
  @HttpCode(HttpStatus.OK)
  @Get()
  index() {
    return 'Yes, we are up and running!';
  }
}
