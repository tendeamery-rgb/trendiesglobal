# Trendies owner guide: admin password, AI categories and bulk email

This guide is for Tende. It explains the private owner settings in plain English.

## 1. The admin password

You said you never made an admin password. That is okay. You create it yourself in Netlify.

This password is only for private Trendies owner pages, like:

- `https://trendiesglobal.com/DATA_DASHBOARD.html`
- `https://trendiesglobal.com/admin/signups`
- `https://trendiesglobal.com/admin/emails`

It is not your GitHub password, Netlify password, Resend password or email password.

### What to add in Netlify

Go to:

Netlify -> your Trendies site -> Site configuration -> Environment variables

Add these two variables:

```txt
TRENDIES_ADMIN_PASSWORD=your-long-private-owner-password
ADMIN_SECRET=your-long-private-owner-password
```

You can use the same value for both. Keep it private.

Good password style:

```txt
Trendies-Private-Long-Random-Words-2026
```

Do not use that exact example. Make your own.

## 2. OpenAI key for AI categorisation

The website is already ready for AI categorisation.

The key must be added in Netlify only. Never paste it into the website code, GitHub, a public file or a public chat.

Add these Netlify environment variables:

```txt
OPENAI_API_KEY=your-openai-api-key
OPENAI_CATEGORISATION_MODEL=gpt-5.6-luna
AI_TIMEOUT_MS=5000
```

What happens after this is added:

- Every signup still saves first.
- The site still uses built-in categories such as country, region, respondent type, partner type, activity tags and safety tags.
- OpenAI adds extra owner-friendly fields:
  - `ai_summary`
  - `ai_priority`
  - `ai_tags`
- If OpenAI is slow, missing or has an error, the form still works and the signup still saves.

## 3. Automatic welcome email

New signups already receive one automatic welcome email.

The code checks `welcome_email_sent_at`, so the same email should not get duplicate welcome emails if they submit again.

Current automatic welcome subject:

```txt
Welcome to Chapter One
```

## 4. Draft onboarding email for existing signups

Use this if you want to email everyone who already signed up.

Subject:

```txt
Welcome to Chapter One
```

Preview text:

```txt
You are on the early Trendies Global list. Here is what happens next.
```

Body:

```txt
You are officially part of Chapter One of Trendies Global.

This started from a simple feeling: so many of us want our coming-of-age chapter, but we do not want to do it alone. We want the picnic, the walk through the city, the card games, the music, the golden hour, the new friends, and the slightly terrifying but beautiful feeling of saying yes to life again.

Right now, Trendies is still idea-stage, which is why your signup matters. Every response helps show where the first chapters could begin, what people would actually show up for, and what would make it feel safe.

A few things to know:
You are not buying a ticket.
You are not committing to anything.
You are helping shape what Chapter One becomes.

For now:
Follow the Instagram channel for updates.
Invite one friend who would understand the vision.
Keep an eye out for first city interest, creative opportunities, and small safe public plans.

The aim is simple: low-pressure, public, warm plans that make it easier to make new friends, expand your circle, and live a little more fully.

Welcome to Chapter One.
```

CTA button:

```txt
Join the Instagram channel
https://www.instagram.com/channel/AbYv47ILon7Ws8HJ/
```

This draft is now prefilled inside:

```txt
https://trendiesglobal.com/admin/emails
```

The private email page also has four visual templates:

- Onboarding
- City update
- Creative call
- Partner note

Each one follows the same simple structure:

1. Warm hello
2. Short main note
3. One clear action
4. Safe close with automatic preferences and unsubscribe links

## 5. How to bulk email everyone

Use the private Trendies email page first because it already filters for safer recipients.

Open:

```txt
https://trendiesglobal.com/admin/emails
```

Then:

1. Paste your `TRENDIES_ADMIN_PASSWORD` into the admin password box.
2. Click `Load audience`.
3. Check the number of eligible recipients.
4. Edit the subject and body if you want.
5. Click `Send test to me`.
6. Open your own inbox and check the test email.
7. If it looks right, go back to the private email page.
8. Type `SEND` into the final confirmation box.
9. Click `Send to real audience`.

The page only targets people who:

- opted into updates
- confirmed they are 18+
- have not unsubscribed
- have not bounced

Every email automatically includes preference and unsubscribe links.

## 6. How to use Resend for mass email later

The website also syncs opted-in signups to Resend Contacts.

For future newsletters:

1. Go to Resend.
2. Open Contacts or Broadcasts.
3. Create a broadcast/newsletter.
4. Send only to contacts who opted into updates and are not unsubscribed.
5. Keep the message clear, warm and not too frequent.

For launch week, the private page at `/admin/emails` is simpler because it uses your website database directly.

## 7. Quick test after adding the password and OpenAI key

After adding the Netlify variables, trigger a new deploy in Netlify, then test:

1. Submit one new signup using your own spare email.
2. Check that the welcome email arrives.
3. Open `https://trendiesglobal.com/DATA_DASHBOARD.html`.
4. Enter your admin password or export secret.
5. Confirm the signup appears.
6. Open `https://trendiesglobal.com/admin/emails`.
7. Enter your admin password.
8. Click `Load audience`.
9. Click `Send test to me`.

If OpenAI categorisation is active, new rows should start showing `ai_summary`, `ai_priority` and `ai_tags`.
