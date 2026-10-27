import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { diagnosePlantWithKindwise, isKindwiseConfigured } from './server/kindwiseService.js'
import { askAssistant } from './server/assistantService.js'

/**
 * Vite Dev Server Plugin for Shet Samarth AI Voice Assistant
 * Securely handles OpenRouter chat completions & Sarvam TTS in dev mode without exposing keys.
 */
function assistantDevServerPlugin() {
  return {
    name: 'assistant-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/assistant/chat') && req.method === 'POST') {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString();
              const body = JSON.parse(rawBody || '{}');
              const result = await askAssistant({
                message: body.message || body.query,
                language: body.language || body.lang,
                history: body.history,
                generateAudio: body.generateAudio !== false
              });
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.success ? 200 : 500;
              res.end(JSON.stringify(result));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: err.message || 'Error processing assistant request'
              }));
            }
          });
          return;
        }

        if (url.startsWith('/api/assistant/chat') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'online',
            service: 'Shet Samarth Assistant Dev Server',
            provider: 'OpenRouter + Sarvam AI'
          }));
          return;
        }

        next();
      });
    }
  };
}

/**
 * Vite Dev Server Plugin for Kindwise crop.health API
 * Securely handles server-side diagnosis requests during local development without exposing API key.
 */
function kindwiseDevServerPlugin() {
  return {
    name: 'kindwise-crop-health-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        
        // 1. Health & Configuration Status Check
        if (url.startsWith('/api/diagnosis/engine-status') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            primaryEngine: "Kindwise crop.health Official AI",
            kindwiseConfigured: isKindwiseConfigured(),
            endpoint: "/api/diagnosis/analyze",
            status: "online"
          }));
          return;
        }

        // 2. Main Plant Diagnosis Endpoint
        if (url.startsWith('/api/diagnosis/analyze') && req.method === 'POST') {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString();
              let body = {};
              const contentType = req.headers['content-type'] || '';
              
              if (contentType.includes('application/json')) {
                body = JSON.parse(rawBody || '{}');
              } else {
                // Parse standard form data fields
                try {
                  body = JSON.parse(rawBody);
                } catch {
                  const paramParts = rawBody.split('&');
                  for (const part of paramParts) {
                    const [k, v] = part.split('=');
                    if (k) body[decodeURIComponent(k)] = decodeURIComponent(v || '');
                  }
                }
              }

              const image = body.image || body.imageBase64;
              const crop = body.crop || body.knownCrop;
              const latitude = body.latitude || body.lat;
              const longitude = body.longitude || body.lng;

              const result = await diagnosePlantWithKindwise({
                imageBase64: image,
                latitude,
                longitude,
                knownCrop: crop,
                growthStage: body.growthStage,
                symptomOnset: body.symptomOnset,
                weatherHistory: body.weatherHistory
              });

              const statusCode = result.status || (result.success ? 200 : 500);
              res.statusCode = statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                errorType: 'SERVER_MIDDLEWARE_ERROR',
                message: err.message || 'Failed to process diagnosis request'
              }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    kindwiseDevServerPlugin(),
    assistantDevServerPlugin()
  ],
  server: {
    proxy: {
      '/fast2sms-proxy': {
        target: 'https://www.fast2sms.com/dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fast2sms-proxy/, ''),
        secure: false
      },
      '/twofactor-proxy': {
        target: 'https://2factor.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/twofactor-proxy/, ''),
        secure: false
      },
      '/sarvam-proxy': {
        target: 'https://api.sarvam.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sarvam-proxy/, ''),
        secure: false
      },
      '/kindwise-proxy': {
        target: 'https://crop.kindwise.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kindwise-proxy/, ''),
        secure: false
      }
    }
  }
})
