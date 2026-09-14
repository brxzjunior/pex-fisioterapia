import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).default('mock-google-client-id'),
  GOOGLE_CLIENT_SECRET: z.string().min(1).default('mock-google-client-secret'),
  GOOGLE_REDIRECT_URI: z.string().url().default('http://localhost:3333/api/auth/google/callback'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter no mínimo 32 caracteres').default('super-secret-key-32-chars-long-at-least-fisio-pro'),
  ALLOWED_ADMIN_EMAIL: z.string().email().default('fisioterapeuta@exemplo.com'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Configuração inválida de variáveis de ambiente:', _env.error.format());
  throw new Error('Falha ao carregar as variáveis de ambiente necessárias.');
}

export const env = _env.data;
