# ⚽ WorldPool 2026 — Complete Setup Guide

Everything you need to get your World Cup pool live. All free. Takes about 30 minutes.

---

## WHAT YOU'LL USE (all free)

| Service | What it does | Cost |
|--------|-------------|------|
| **GitHub** | Stores your code | Free |
| **Supabase** | Database + user accounts | Free |
| **Vercel** | Hosts your website | Free |

---

## STEP 1 — Get the Code on GitHub

1. Go to **github.com** and create a free account (if you don't have one)
2. Click the **+** button → **New repository**
3. Name it `worldcup-pool` → click **Create repository**
4. Download **GitHub Desktop** from **desktop.github.com** — it makes this easy
5. In GitHub Desktop, clone your new empty repo to your computer
6. **Copy all the files from the `worldcup-pool` folder** (that Claude gave you) into that cloned folder on your computer
7. In GitHub Desktop, you'll see all the files listed. Write "Initial upload" in the summary box → click **Commit to main** → click **Push origin**

Your code is now on GitHub. ✅

---

## STEP 2 — Set Up Supabase (Your Database)

1. Go to **supabase.com** → click **Start your project** → sign up free
2. Click **New Project**
   - Give it a name: `worldcup-pool`
   - Set a database password (save this somewhere — you won't need it often)
   - Choose a region close to you
   - Click **Create new project** (takes ~2 minutes to spin up)
3. Once it's ready, click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `supabase-schema.sql` from the worldcup-pool folder, copy ALL of it, paste it into the SQL editor
6. Click **Run** — you should see "Success. No rows returned"
7. Now go to **Project Settings** → **API**
8. Copy these two values (you'll need them in Step 3):
   - **Project URL** (looks like: `https://abcdef.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
9. Also in Project Settings → **Authentication** → **Email** → make sure **Enable email confirmations** is ON (so fake sign-ups can't happen)

Database is ready. ✅

---

## STEP 3 — Deploy to Vercel (Make It Live)

1. Go to **vercel.com** → sign up with your GitHub account (free)
2. Click **Add New** → **Project**
3. Find your `worldcup-pool` repo → click **Import**
4. Before clicking Deploy, click **Environment Variables** and add these 3 variables:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 2 |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2 |
   | `VITE_ADMIN_EMAIL` | **Your email address** (you'll be the admin) |

5. Click **Deploy**
6. Wait about 2 minutes — Vercel builds and deploys your app
7. You'll get a URL like `worldcup-pool.vercel.app` — **that's your app!**

Your app is live. ✅

---

## STEP 4 — Create Your Admin Account

1. Open your app URL in the browser
2. Click **Sign up** and create an account using the **same email** you put in `VITE_ADMIN_EMAIL`
3. Check your email, click the confirmation link
4. Sign back in — you'll see an **Admin** tab in the navigation. That's your control panel!

---

## STEP 5 — Share With Friends

Send them the link. They:
1. Open it in their browser
2. Sign up with their name + email
3. Make their picks!

**Tip for phone users:** Tell them to tap the **Share** button in Safari/Chrome → **Add to Home Screen** — it'll look and feel like a real app icon on their phone.

---

## HOW YOU RUN THE POOL (Admin Guide)

### Before the tournament:
- Keep **Group Picks = ON** so friends can pick their group advancers
- Keep **Bracket = OFF**

### When group stage ends:
1. Go to **Admin** panel
2. Turn OFF group picks (so no one can change them)
3. Enter the real results for each group — pick the 2 teams that actually advanced
4. Click **Save Results & Score All Players** — points are automatically calculated
5. Click **Seed Bracket** — this puts the real teams into the knockout bracket
6. Turn ON bracket picks
7. Text your friends: "Group stage is done! Go fill out your bracket!"

### As knockout rounds happen:
- You'll need to add bracket scoring manually (coming in future update) or track it yourself

---

## POINTS SYSTEM

| Achievement | Points |
|------------|--------|
| Correctly picked a team to advance from group | 3 pts |
| Also got them as group winner | +2 pts (5 total) |
| Round of 32 correct pick | 5 pts |
| Round of 16 correct pick | 8 pts |
| Quarterfinal correct pick | 11 pts |
| Semifinal correct pick | 14 pts |
| Final correct pick | 17 pts |
| Correct champion | 25 pts |

---

## CUSTOM DOMAIN (Optional, also free)

Want `worldpool2026.com` instead of `worldcup-pool.vercel.app`?

1. Buy a domain at **namecheap.com** (~$10/year for .com)
2. In Vercel → your project → **Settings** → **Domains**
3. Add your domain and follow the instructions to point it at Vercel

---

## TROUBLESHOOTING

**"I see a blank white page"**
→ The environment variables might not be set. Go to Vercel → your project → Settings → Environment Variables and double-check the 3 values.

**"Sign up email never arrives"**
→ Check spam folder. Also check Supabase → Authentication → make sure the site URL is set to your Vercel URL.

**"Friends can't sign up"**
→ In Supabase → Authentication → URL Configuration → add your Vercel URL to the "Redirect URLs" list.

**Updating the app after changes:**
If you edit any code files later, just save them in the folder and use GitHub Desktop to commit + push. Vercel will automatically redeploy within 2 minutes.

---

That's it! You've built and deployed a real web app. 🎉
