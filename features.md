# AetherFlow SaaS Marketing Hub - Core Features & System Capabilities

Welcome to **AetherFlow**, a high-fidelity SaaS marketing platform designed to streamline copywriting, graphic asset creation, campaign planning, and click performance monitoring inside a single, unified workspace.

---

## 🌟 Executive Feature Summary

AetherFlow brings together several enterprise-level tools:
1. **AI Copywriter**: Generates conversion-focused marketing copy across 5 distinct channels using integrated Google Gemini models.
2. **Creative Image Studio**: Renders abstract and realistic visual layouts for digital campaigns with progressive loader feedback.
3. **Social Media Scheduler**: Operates a weekly calendar schedule where drafts can be written, optimized for SEO, and staged.
4. **SVG Performance Analytics**: Monitors click metrics and distribution channels using custom SVG line graphs and bar charts.
5. **Sandbox & Cloud Sync Modes**: Works out-of-the-box in local sandbox mode, or synchronizes instantly with a cloud-hosted Supabase database once configured.

---

## 🏗️ Detailed Feature Breakdown

### 1. Unified Workspace Dashboard
* **Glassmorphic Layout**: Dark theme aesthetics utilizing HSL colors, blur backdrops, and active-focus neon glows (Purple, Cyan, Indigo, Pink).
* **Workspace Swapping**: Interactive dropdown to switch between multiple organizations (e.g., "My Hub" and Acme Corp).
* **Developer Keys Panel**: Dedicated developer portal to input custom Google Gemini API keys. Keys are automatically stored in the user's Supabase database profile if logged in.
* **Remaining Credit Indicator**: Live visual credit meter linked directly to execution logs. Swapping tiers automatically updates maximum credit caps (50 for Free, 550 for Pro).

### 2. AI Copywriter Engine
* **Template-Driven Generation**: Formats outputs for specific marketing nodes:
  * 🔍 *Google Ads Search*: Generates high-CTR headline clusters and descriptions.
  * 💼 *LinkedIn Hook*: Crafts hook story openings that drive user impressions.
  * 🚀 *Product Pitch*: Writes persuasive descriptions focused on core benefits.
  * 📝 *Blog Intro*: Designs introduction drafts outlining articles.
  * 🐦 *Twitter/X Thread*: Generates punchy thread hook options.
* **Context Modifiers**: Select target audiences, tones (e.g. Persuasive, Witty, Professional), and length parameters.
* **Typing Skeleton Loading Screen**: Renders loading skeletons and typewriter animations during generations.
* **Credit Protection Framework**: Checks credit balances before executing requests. Real API calls are validated first; if the call fails (e.g. invalid API key), credits are preserved and an error message is printed. Deducts 5 credits only on successful output.

### 3. Creative Image Studio
* **Bespoke Style Presets**: Apply pre-built aesthetic tokens:
  * 📸 Photorealistic
  * 💻 3D Render
  * 🌆 Synthwave
  * 🎨 Watercolor
  * ✏️ Minimalist Line Art
* **Aspect Ratio Selection**: Formats canvases for diverse platforms (1:1 square, 16:9 widescreen, 9:16 vertical).
* **Progressive Diffusion Logs**: Simulates high-performance rendering nodes (e.g. noise grid maps, texturing, normalized color scales) with progress logs.
* **Interactive Image Grid**: Keeps a visual history of all generated image frames, offering instant previews and high-resolution downloads. Deducts 10 credits per generation.

### 4. Cross-Channel Social Scheduler
* **Weekly Campaign Agenda**: Generates a Mon-Sun weekly calendar matching the current calendar date automatically.
* **Draft Schedule Panel**: Schedule campaign nodes for platforms (Twitter/X, LinkedIn, Facebook, Instagram) at target dates and hours.
* **Contextual SEO Hashtag Optimizer**: Checks draft descriptions and appends matching hashtag sets (e.g. `#saas #founder #buildinpublic` for tech posts) using local context analysis.
* **Interactive Campaign Badges**: Toggle campaign statuses from "Queue" to "Posted" or delete drafts instantly with real-time UI updates.

### 5. SVG Analytics Engine
* **KPI Metrics Counters**: Tracks Traffic Generated, Lead Conversions, Credits Remaining, and Est. Value ($) with performance labels.
* **Interactive SVG Click Graph**: Custom-coded SVG line graph plotting weekly traffic with gradient background fills, coordinate lines, and hover tooltips showing precise click data.
* **Channel Distribution Chart**: Reactive SVG columns showing conversion rates categorized by platform.
* **generative Activity Logs**: Stream of database events capturing AI copy and image history items as they occur.

### 6. Billing System & Checkout Portal
* **Stripe-Inspired Billing**: Integrated payment modal displaying monthly and yearly options (featuring a 20% discount badge).
* **Credit Settlement Flow**: Validates CVV, expiry ranges, name inputs, and stages transactions with progressive loaders before updating state.
* **Interactive Upgrades**: Submitting checkout automatically changes tiers to Premium, granting 500 premium credits immediately.

### 7. User Authentication & Cloud Sync
* **Dual Authorization Portal**: Sign up or sign in securely using email/password.
* **Local Sandbox Fallback**: If database endpoints are unconfigured, the app runs in guest sandbox mode, allowing users to test all generator elements locally.
* **Security Validation Routing**: Utilizes dynamic confirmation redirects (`emailRedirectTo: window.location.origin`) to automatically route email verification links back to the production domain.
* **Global Toast Alert System**: If a database error or network failure is encountered during profile loads, updates, or schedules, a sliding toast alert descends from the top right detailing the exception.

---

## ⚙️ Environment Configuration

To synchronize the platform with a live PostgreSQL backend and enable account registration, define the following variables:

```ini
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*Note: In production hosting providers like AWS Amplify, these must be configured under **App settings** > **Environment variables**.*
