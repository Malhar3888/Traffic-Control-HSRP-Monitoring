import { defineConfig, loadConfigFromFile } from "vite";
import type { ConfigEnv, PluginOption } from "vite";
import path from "path";
import {
  makeTagger,
  injectedGuiListenerPlugin,
  injectOnErrorPlugin,
  monitorPlugin
} from "miaoda-sc-plugin";

const env: ConfigEnv = { command: "serve", mode: "development" };
const configFile = path.resolve(__dirname, "vite.config.ts");
const result = await loadConfigFromFile(env, configFile);
const userConfig = result?.config;

export default defineConfig({
  ...userConfig,
  plugins: ([
    makeTagger(),
    injectedGuiListenerPlugin({
      path: 'https://miaoda-resource-static.s3cdn.medo.dev/common/v2/injected.js'
    }),
    injectOnErrorPlugin(),
    ...(userConfig?.plugins || []),
    {
      name: 'hmr-toggle',
      configureServer(server) {
        let hmrEnabled = true;

        const _send = server.ws.send;
        // We cast _send to any here to stop the "Target allows only 2 elements" error
        server.ws.send = function (payload: any, ...args: any[]) {
          if (hmrEnabled) {
            return (_send as any).apply(server.ws, [payload, ...args]);
          } else {
            console.log('[HMR disabled] skipped:', payload?.type || payload);
          }
        };

        // Middlewares with explicit types for req/res to avoid 'any' errors
        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_off', (_req, res) => {
          hmrEnabled = false;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 0, msg: 'HMR disabled' }));
        });

        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_on', (_req, res) => {
          hmrEnabled = true;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 0, msg: 'HMR enabled' }));
        });

        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_reload', (_req, res) => {
          if (hmrEnabled) {
            server.ws.send({ type: 'full-reload', path: '*' });
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 0, msg: 'Manual full reload triggered' }));
        });
      },
      load(id: string) {
        if (id === 'virtual:after-update') {
          return `
            if (import.meta.hot) {
              import.meta.hot.on('vite:afterUpdate', () => {
                window.postMessage({ type: 'editor-update' }, '*');
              });
            }
          `;
        }
      },
      transformIndexHtml(html: string) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: { type: 'module', src: '/@id/virtual:after-update' },
              injectTo: 'body'
            }
          ]
        };
      }
    },
    monitorPlugin({
      scriptSrc: 'https://miaoda-resource-static.s3cdn.medo.dev/sentry/browser.sentry.min.js',
      sentryDsn: 'https://e3c07b90fcb5207f333d50ac24a99d3e@sentry.miaoda.cn/233',
      environment: 'development',
      appId: 'app-8rwta3kbsqgx'
    })
  ] as PluginOption[]).flat(),
  
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});