/**
 * PM2 ecosystem config: server + Cloudflare tunnel.
 * From project root: pm2 start ecosystem.config.cjs
 * Then: pm2 save && pm2 startup  (optional, to restore on reboot)
 */
module.exports = {
  apps: [
    {
      name: 'balhinbalay-server',
      script: 'server/index.js',
      cwd: __dirname,
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
      // .env is loaded by server/index.js via dotenv from project root
    },
    {
      name: 'balhinbalay-tunnel',
      script: 'cloudflared',
      args: 'tunnel run balhinbalay',
      cwd: __dirname,
      interpreter: 'none',
      // cloudflared must be in PATH (install via .deb, brew, or add to PATH)
    },
  ],
};
