# Deploy BalhinBalay on a Linux server (one app)

Run the React frontend + REST API + PostgreSQL as a **single deployable app** on one Linux server.

---

## 1. On your Linux server: install Node, npm, PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib

# Or use Node 18+ via NodeSource if your distro has an old Node
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt install -y nodejs
```

---

## 2. Create the database and load the schema

From the project root (after cloning):

```bash
cd /path/to/your/repo
node server/create-database.js   # if you use the script; or create DB manually
node server/run-schema.js
```

Or manually with PostgreSQL:

```bash
sudo -u postgres psql -c "CREATE USER balhinbalay WITH PASSWORD 'YOUR_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE balhinbalay OWNER balhinbalay;"
sudo -u postgres psql -d balhinbalay -f /path/to/your/repo/schema.sql
```

Use a strong password and replace `/path/to/your/repo` with the real path. Then (optional) seed sample data:

```bash
node server/seed.js
```

This inserts sample listings and a test user (`test@example.com` / `password123`) if the DB is empty.

---

## 3. Clone/upload the project and build the frontend

```bash
cd /var/www   # or wherever you keep apps
git clone https://github.com/YOUR_USER/BalhinBalay.git
cd BalhinBalay
npm install
npm run build
```

This creates the `build/` folder that the server will serve.

---

## 4. Install server dependencies and set environment

```bash
cd server
npm install
```

Create a `.env` file in the **project root** (or in `server/` if you load dotenv from there):

```bash
cd /var/www/BalhinBalay
cat > .env << 'EOF'
PORT=5000
DATABASE_URL=postgresql://balhinbalay:YOUR_DB_PASSWORD@localhost:5432/balhinbalay
EOF
chmod 600 .env
```

Update `YOUR_DB_PASSWORD` to match the user you created. If your server loads `.env` from `server/`, put the same `.env` inside `server/` instead.

---

## 5. Run the app (one process = API + static site)

From the **project root**:

```bash
cd /var/www/BalhinBalay
node server/index.js
```

Or from `server/`:

```bash
cd /var/www/BalhinBalay/server
node index.js
```

Ensure the server is started so it can find `../build`. Then:

- **Frontend:** `http://YOUR_SERVER_IP:5000`
- **API:** `http://YOUR_SERVER_IP:5000/api/health` and `http://YOUR_SERVER_IP:5000/api/listings`

One Node process serves both.

---

## 6. Keep it running: PM2 (recommended)

```bash
sudo npm install -g pm2
cd /var/www/BalhinBalay
pm2 start server/index.js --name balhinbalay
pm2 save
pm2 startup   # follow the command it prints to enable on boot
```

PM2 restarts the app if it crashes and starts it after a reboot.

---

## 7. Optional: Nginx in front (port 80/443, SSL)

So the app is available on port 80 (and 443 with HTTPS) instead of 5000:

```nginx
# /etc/nginx/sites-available/balhinbalay
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/balhinbalay /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

For HTTPS, add a cert (e.g. `certbot --nginx`).

---

## Summary

| What            | Where / how                    |
|-----------------|--------------------------------|
| PostgreSQL      | System service (schema from `schema.sql`) |
| React frontend  | Built to `build/`, served by Node |
| REST API        | Same Node process, under `/api` |
| One “app”       | Single Node process (`server/index.js`) |
| Process manager | PM2 (or systemd)               |
| Optional        | Nginx reverse proxy + SSL      |

After deployment, point the frontend at the same origin (e.g. `https://your-domain.com`) so API calls go to `/api/*` with no CORS issues.
