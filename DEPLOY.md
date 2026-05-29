# Deployment Checklist

## Pre-Deploy
- [ ] All tests pass: `npm test` (or manual QA)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Git: all changes committed, no uncommitted files

## Environment Variables
Set in Vercel dashboard (Settings > Environment Variables):
- `DATABASE_URL=postgresql://user:pass@host/db?sslmode=require`
- `NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>`
- `NEXTAUTH_URL=https://your-domain.com`
- `IMGBB_API_KEY=<from https://api.imgbb.com>`

## Vercel Deploy
1. Push to main branch
2. Vercel auto-deploys
3. Check Functions (serverless logs) for errors
4. Test endpoints: `/api/health` (if exists) or `/api/products`

## Post-Deploy
- [ ] Test checkout flow end-to-end
- [ ] Admin login works
- [ ] Orders appear in admin dashboard
- [ ] Image upload works (test IMGBB_API_KEY)
- [ ] Verify DB migration ran (drizzle)

## Troubleshooting
- **Orders 401**: Check NEXTAUTH_SECRET, admin session cookie
- **Image upload 503**: Check IMGBB_API_KEY is set and valid
- **DB connection error**: Verify DATABASE_URL, whitelist Vercel IPs in Neon