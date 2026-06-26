import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChannelManagementService } from './channel-management.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from 'src/common/models/channel.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('channels')
@Controller('channels')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class ChannelManagementController {
  constructor(
    private readonly channelManagementService: ChannelManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new YouTube channel configuration' })
  @ApiBody({ type: CreateChannelDto })
  @ApiResponse({
    status: 201,
    description: 'Channel created successfully',
    type: Channel,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@CurrentUser() user: UserPlain, @Body() dto: CreateChannelDto) {
    return this.channelManagementService.create({
      ...dto,
      userId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all YouTube channel configurations' })
  @ApiResponse({
    status: 200,
    description: 'List of channels',
    type: [Channel],
  })
  async findAll(@CurrentUser() user: UserPlain) {
    return this.channelManagementService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get channel configuration by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiResponse({
    status: 200,
    description: 'Channel details',
    type: Channel,
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async findOne(@Param('id') id: string) {
    return this.channelManagementService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update channel configuration by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({
    status: 200,
    description: 'Channel updated successfully',
    type: Channel,
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelManagementService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete channel configuration by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiResponse({ status: 200, description: 'Channel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async remove(@Param('id') id: string) {
    await this.channelManagementService.remove(id);
    return { message: 'Channel deleted successfully' };
  }
}
