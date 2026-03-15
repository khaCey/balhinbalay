# Cloudflare Tunnel — expose your local server to the internet

Use [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) (cloudflared) to expose your BalhinBalay server (React + API on port 5000) so you can access it from outside your network via a public HTTPS URL.

**Website and Android both use the tunnel:** Build once with the tunnel URL; the same build is used for the site and (after sync) for the Android app.

1. **Build for tunnel (website + API):**
   ```bash
   npm run build:tunnel:clean
   ```
   (Or `npm run build:tunnel`. Use `build:tunnel:clean` if the site still shows "API: http://localhost:5000".)  
   This uses `.env.production` (`REACT_APP_API_URL=https://balhinbalay.com`).

2. **Start the server**, then **run the tunnel**:
   ```bash
   node server/index.js
   ```
   In another terminal:
   ```bash
   cloudflared tunnel run balhinbalay
   ```
   The **website** at https://balhinbalay.com will now call `https://balhinbalay.com/api`.

3. **Android app (optional):** To have the app use the tunnel too, sync the same production build:
   ```bash
   npm run cap:sync:android:production:clean
   ```
   Then run the app from Android Studio. Website and app both use `https://balhinbalay.com`.

---

## 1. Install cloudflared

**Windows (PowerShell):**

```powershell
# Using winget (recommended)
winget install Cloudflare.cloudflared

# Or download from: https://github.com/cloudflare/cloudflared/releases
# Extract and add to PATH.
```

**macOS:**

```bash
brew install cloudflared
```

**Linux (e.g. Ubuntu):**

```bash
# Add package repo and install
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

Verify:

```bash
cloudflared --version
```

---

## 2. Log in to Cloudflare

This opens a browser and saves a certificate for your account:

```bash
cloudflared tunnel login
```

Choose your domain (or add one in the Cloudflare dashboard). A cert file is saved (e.g. `~/.cloudflared/cert.pem`).

---

## 3. Create a tunnel

```bash
# From project root or any directory
cloudflared tunnel create balhinbalay
```

You’ll see a tunnel ID and the config directory (e.g. `~/.cloudflared/`). Note the **tunnel ID** (UUID) for the next step.

---

## 4. Configure the tunnel

Create or edit the config file.

**Windows:** `%USERPROFILE%\.cloudflared\config.yml`  
**macOS/Linux:** `~/.cloudflared/config.yml`

Example (replace `YOUR_TUNNEL_ID` with the ID from step 3):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: C:\Users\YOUR_USERNAME\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: balhinbalay.yourdomain.com
    service: http://localhost:5000
  - hostname: api.balhinbalay.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

- Use **one** `hostname` if you want both the app and API on the same URL (e.g. `balhinbalay.yourdomain.com` → `http://localhost:5000`). The server already serves the React app and `/api` on the same origin.
- `credentials-file` on Windows use a path like `C:\Users\YourName\.cloudflared\<tunnel-id>.json`. On macOS/Linux use `~/.cloudflared/<tunnel-id>.json` or the full path.

**Minimal single hostname (app + API together):**

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: balhinbalay.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

---

## 5. Route DNS to the tunnel

Create a CNAME record that points your hostname to the tunnel:

```bash
cloudflared tunnel route dns balhinbalay balhinbalay.yourdomain.com
```

Or in the [Cloudflare Dashboard](https://dash.cloudflare.com): **DNS** → **Records** → Add **CNAME**: name `balhinbalay` (or your subdomain), target `YOUR_TUNNEL_ID.cfargotunnel.com`, Proxy status **Proxied** (orange).

---

## 6. Run the server and the tunnel

**Terminal 1 — your app (from project root):**

```bash
npm run build
node server/index.js
```

(or `npm run server`; ensure the server is listening on port 5000).

**Terminal 2 — Cloudflare Tunnel:**

```bash
cloudflared tunnel run balhinbalay
```

Leave both running. Your app is now available at `https://balhinbalay.yourdomain.com` (or whatever hostname you used). The React app and `/api` are on the same origin, so no extra API URL config is needed when using this URL in the browser.

---

## 7. (Optional) Run the tunnel as a service

**Windows:** use Task Scheduler or NSSM to run `cloudflared tunnel run balhinbalay` at login or as a service.

**Linux (systemd):**

```bash
sudo cloudflared service install
# Ensure config and credentials are under /etc/cloudflared/ or that the service user can read ~/.cloudflared/
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## Checklist

| Step | Action |
|------|--------|
| 1 | Install `cloudflared` |
| 2 | `cloudflared tunnel login` (browser auth) |
| 3 | `cloudflared tunnel create balhinbalay` (note tunnel ID) |
| 4 | Edit `~/.cloudflared/config.yml`: tunnel ID, credentials path, hostname → `http://localhost:5000` |
| 5 | `cloudflared tunnel route dns balhinbalay balhinbalay.yourdomain.com` (or add CNAME in dashboard) |
| 6 | Start server (`node server/index.js`), then `cloudflared tunnel run balhinbalay` |

---

## Mobile app (Capacitor) and the tunnel

To use the **same** tunnel URL from the mobile app (so it works from anywhere):

1. Build the app with that URL as the API base, e.g. create `.env.android.production` (or similar) with:
   ```env
   REACT_APP_API_URL=https://balhinbalay.yourdomain.com
   ```
2. Build and sync: e.g. `env-cmd -f .env.android.production npm run build && npx cap sync android`.
3. Run the app; it will call `https://balhinbalay.yourdomain.com/api` (same origin as the web app when using one hostname).

Ensure your server and tunnel are running and reachable from the internet when testing the app.
