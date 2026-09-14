import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 FisioPro Backend online em http://localhost:${env.PORT}`);
    console.log(`🛡️  Segurança: Helmet, CORS, Rate Limit e Cookies ativos.`);
  } catch (err) {
    console.error('❌ Erro fatal ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
