# Security & Key Rotation

> **IMPORTANT**: These keys were exposed in public git history. They must be rotated
> before production launch. After rotation, update `.env.local` AND Vercel env vars.

## Steps (do in order)

### 1. Razorpay (LIVE) — [dashboard.razorpay.com](https://dashboard.razorpay.com)
1. Go to **Settings → Websites & API keys** (or **API Keys** under Account & Settings)
2. Generate a **new key pair** (key_id + key_secret)
3. **Note:** Razorpay LIVE keys can only be rotated by regenerating; old ones stop working once you switch the site to the new pair
4. Update:
   - `.env.local`: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - Vercel → Settings → Environment Variables: same three keys
5. The webhook secret (`RAZORPAY_WEBHOOK_SECRET = lk_webhook_2026_secure`) does **not** need rotation — it's not in git history, but re-verify it matches the dashboard.

### 2. Supabase — [supabase.com/dashboard](https://supabase.com/dashboard)
1. Open your project (`rswszmbzykrzidndyeed`) → **Settings → API**
2. Click **Roll** next to `service_role` key → confirm
3. Copy the new service_role key
4. Update:
   - `.env.local`: `SUPABASE_SERVICE_KEY`
   - Vercel → Environment Variables: `SUPABASE_SERVICE_KEY`
5. The anon key + URL are public by design (they're in the client bundle); no need to rotate unless you want to.

### 3. Groq — [console.groq.com](https://console.groq.com)
1. Go to **API Keys** → create a new key → delete the old one
2. Update `.env.local` + Vercel: `GROQ_API_KEY`

### 4. GitHub (optional, for manual cron triggers)
1. Create a PAT at github.com → **Settings → Developer settings → Personal access tokens** (fine-grained, repo read/write on `Shashwat1319/lucknowkaam`)
2. Set `GH_PAT` in `.env.local` + Vercel

## After rotation
- Re-deploy: `vercel --prod` (or push to main)
- Re-verify: run a test paid listing end-to-end
- Consider removing the leaked keys from git history via `git filter-repo` (optional; keys are being rotated so it's not strictly required)

## Verify rotation worked
- `curl -u "<key_id>:<key_secret>" https://api.razorpay.com/v1/orders` should return an order (new keys)
- Check Supabase → Logs → API for service-role calls returning 401 with old key