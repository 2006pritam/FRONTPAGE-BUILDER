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

The preview screen includes **Connect Telecloud**, **Save to Telecloud**, and **Save in Cloud**. Connect Telecloud opens the Telecloud login, then returns a short-lived one-time connection token to this builder. The save buttons create a PDF and upload it to the signed-in user's Telecloud drive; they do not handle or store Telegram credentials.

For a custom Telecloud backend, set this build variable in Vercel:

```env
NEXT_PUBLIC_TELECLOUD_API_URL=https://your-telecloud-render-service.onrender.com
NEXT_PUBLIC_TELECLOUD_WEB_URL=https://your-telecloud-pages.pages.dev
```

On the Telecloud Render service, add the deployed Frontpage Builder origin to the comma-separated `FRONTEND_ORIGIN` value, for example:

```env
FRONTEND_ORIGIN=https://your-frontpage-builder.vercel.app,https://your-project.pages.dev
```

The user can click **Connect Telecloud** and sign in normally. The one-time token expires after ten minutes and is consumed after one upload.
