import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
export interface DatabaseConfig {
  url: string;
}

// JWT配置
export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

// CORS配置
export interface CORSConfig {
  origin: string[];
}

// 上传配置
export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  uploadDir: string;
}

// 语音识别配置
export interface SpeechConfig {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
}

// Redis配置
export interface RedisConfig {
  url: string;
}

// 邮件配置
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

// 主配置接口
export interface Config {
  env: string;
  port: number;
  database: DatabaseConfig;
  jwt: JWTConfig;
  cors: CORSConfig;
  upload: UploadConfig;
  speech: SpeechConfig;
  redis: RedisConfig;
  email: EmailConfig;
}

// 配置对象
export const config: Config = {
  env: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '50008', 10),
  
  database: {
    url: process.env['DATABASE_URL']!,
  },
  
  jwt: {
    secret: process.env['JWT_SECRET']!,
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
  
  cors: {
    origin: process.env['CORS_ORIGIN']
      ? process.env['CORS_ORIGIN'].split(',')
      : ['http://localhost:30008', 'http://localhost:50008'],
  },
  
  upload: {
    maxSize: parseInt(process.env['UPLOAD_MAX_SIZE'] || '10485760', 10), // 10MB
    allowedTypes: (process.env['UPLOAD_ALLOWED_TYPES'] || 'image/*,audio/*,video/*').split(','),
    uploadDir: process.env['UPLOAD_DIR'] || 'uploads',
  },
  
  speech: {
    apiKey: process.env['SPEECH_API_KEY'] || '',
    apiSecret: process.env['SPEECH_API_SECRET'] || '',
    endpoint: process.env['SPEECH_ENDPOINT'] || '',
  },
  
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
  },
  
  email: {
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587', 10),
    secure: process.env['EMAIL_SECURE'] === 'true',
    user: process.env['EMAIL_USER'] || '',
    pass: process.env['EMAIL_PASS'] || '',
  },
};

// 开发环境配置
export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTest = config.env === 'test'; 