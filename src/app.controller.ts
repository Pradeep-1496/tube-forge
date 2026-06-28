import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('running')
  running(): boolean {
    return true;
  }
}
