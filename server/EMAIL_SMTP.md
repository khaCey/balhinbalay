# SMTP and confirmation email

## Auto-retry on port 465

If the connection fails on port **587** (e.g. timeout or refused), the app automatically tries **465** with SSL. If that works, set in `.env`: `SMTP_PORT=465` and `SMTP_SECURE=true` so future sends use the working port.

## If you still see "SMTP connection timed out"

1. **Check your `.env`** (in project root). You need at least:
   - `SMTP_HOST` — e.g. `smtp.ionos.com` or `smtp.ionos.co.uk` for IONOS
   - `SMTP_PORT` — `587` (STARTTLS) or `465` (SSL). For IONOS, try `587` first; if it times out, try `465`
   - `SMTP_USER` — full email (e.g. `noreply@yourdomain.com`)
   - `SMTP_PASS` — password for that mailbox
   - `SMTP_SECURE` — set to `true` only if using port `465`; use `false` for port `587`

2. **Port vs secure**
   - Port **587**: usually `SMTP_SECURE=false` (connection uses STARTTLS after connect)
   - Port **465**: use `SMTP_SECURE=true`
   - Port **25**: often blocked by ISPs; avoid if possible

3. **Firewall**
   - Your machine or network may block outbound SMTP. Allow outbound TCP to `SMTP_HOST` on `SMTP_PORT` (e.g. 587 or 465).
   - Corporate/VPN networks often block 587; try from a different network or use 465.

4. **IONOS**
   - Host: `smtp.ionos.com` (or regional variant).
   - Use the full email as username; password is the mailbox password (or app password if you use 2FA).
   - IONOS docs: search "IONOS SMTP settings" for your region.

5. **Run the sample again**
   - Timeouts have been increased (script: 25s, transporter: 20s). Run:
   - `npm run email:sample`
   - If it still times out, the server is likely unreachable (wrong host/port or firewall).
