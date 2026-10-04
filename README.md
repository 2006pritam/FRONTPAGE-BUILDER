# Fork of Supernoxi app builder

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/modakpritam06-gmailcoms-projects/v0-supernoxi-app-builder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/7HKrj1keHp2)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/modakpritam06-gmailcoms-projects/v0-supernoxi-app-builder](https://vercel.com/modakpritam06-gmailcoms-projects/v0-supernoxi-app-builder)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/7HKrj1keHp2](https://v0.app/chat/7HKrj1keHp2)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Save to Telecloud

When the current browser has an active Telegram session in Telecloud, the preview screen shows **Save to Telecloud**. It creates a PDF of the front page and uploads it to the signed-in user's Telecloud drive; it does not handle or store Telegram credentials.

For a custom Telecloud backend, set this build variable in Vercel:

```env
NEXT_PUBLIC_TELECLOUD_API_URL=https://your-telecloud-render-service.onrender.com
```

On the Telecloud Render service, add the deployed Frontpage Builder origin to the comma-separated `FRONTEND_ORIGIN` value, for example:

```env
FRONTEND_ORIGIN=https://your-frontpage-builder.vercel.app,https://your-project.pages.dev
```

The user must sign in to Telecloud first in the same browser. The Save button remains hidden when no active Telegram session is detected.
