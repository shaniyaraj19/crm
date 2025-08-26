"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = exports.getDatabaseUri = exports.isTest = exports.isProduction = exports.isDevelopment = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
// Environment validation schema
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('5000'),
    API_VERSION: zod_1.z.string().default('v1'),
    // Database
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/v-accel-crm'),
    MONGODB_TEST_URI: zod_1.z.string().optional(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    // Email
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    // AWS
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().default('us-east-1'),
    AWS_S3_BUCKET: zod_1.z.string().optional(),
    // Twilio
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_PHONE_NUMBER: zod_1.z.string().optional(),
    // Redis
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    // OAuth
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    MICROSOFT_CLIENT_ID: zod_1.z.string().optional(),
    MICROSOFT_CLIENT_SECRET: zod_1.z.string().optional(),
    // Webhooks
    WEBHOOK_SECRET: zod_1.z.string().optional(),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});
// Validate and export environment variables
exports.env = envSchema.parse(process.env);
// Environment helper functions
const isDevelopment = () => exports.env.NODE_ENV === 'development';
exports.isDevelopment = isDevelopment;
const isProduction = () => exports.env.NODE_ENV === 'production';
exports.isProduction = isProduction;
const isTest = () => exports.env.NODE_ENV === 'test';
exports.isTest = isTest;
// Database URI helper
const getDatabaseUri = () => {
    if ((0, exports.isTest)() && exports.env.MONGODB_TEST_URI) {
        return exports.env.MONGODB_TEST_URI;
    }
    return exports.env.MONGODB_URI;
};
exports.getDatabaseUri = getDatabaseUri;
// Validate required environment variables
const validateEnvironment = () => {
    try {
        envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
    }
    catch (error) {
        console.error('❌ Environment validation failed:', error);
        process.exit(1);
    }
};
exports.validateEnvironment = validateEnvironment;
