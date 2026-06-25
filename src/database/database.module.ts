import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import 'dotenv/config';
import { Metadata } from 'src/common/models/metadata.model';
import { Background } from 'src/common/models/background.model';
import { Audio } from 'src/common/models/audio.model';
import { BackgroundVideo } from 'src/common/models/background-video.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      autoLoadModels: true,
      synchronize: true,
      models: [Metadata, Background, Audio, BackgroundVideo],
    }),
  ],
})
export class DatabaseModule {}
