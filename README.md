# ⚡ SubSync

> Transfer your YouTube subscriptions between accounts in seconds.

SubSync lets you bulk-subscribe to YouTube channels by importing from a CSV file, cloning another channel's subscription list, or using pre-curated **Starter Packs** organized by niche.

---

## ✨ Features

- **CSV Import** — Upload a `.csv` file with channel IDs, URLs, or names
- **Channel Clone** — Search for any YouTube channel and import their public subscriptions
- **Starter Packs** — One-click curated collections of 50+ channels per niche (Gaming, Tech, Music, etc.)
- **AutoSub** — Bulk-subscribe to all selected channels with live progress tracking
- **Export CSV** — Download your current subscriptions as a backup `.csv`
- **Duplicate Detection** — Automatically skips channels you're already subscribed to
- **Rate Limiting** — Throttled API calls to stay within YouTube quota

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Google Cloud](https://console.cloud.google.com/) account

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/youtube-autosub.git
cd youtube-autosub
npm install
```

### 2. Enable the YouTube Data API

1. Go to [Google Cloud Console → API Library](https://console.cloud.google.com/apis/library)
2. Search for **"YouTube Data API v3"**
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to [APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select **External** user type → **Create**
3. Fill in the required fields:
   - **App name**: `SubSync`
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
6. Click **Save and Continue**
7. On the **Test users** page, click **Add Users** and add your Google email
8. Click **Save and Continue** → **Back to Dashboard**

> **Note:** While the app is in "Testing" mode, only the test users you add can sign in. You can add up to 100 test users.

### 4. Create OAuth Client ID

1. Go to [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Set the following:
   - **Application type**: `Web application`
   - **Name**: `SubSync`
   - Under **Authorized redirect URIs**, click **+ ADD URI** and enter:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
4. Click **Create**
5. A dialog will show your **Client ID** and **Client Secret** — copy both

### 5. Set up environment variables

Create or edit the `.env.local` file in the project root:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=any_random_string_here
NEXTAUTH_URL=http://localhost:3000
```

> **Tip:** Generate a secure `NEXTAUTH_SECRET` by running: `openssl rand -base64 32`

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## 📋 CSV Format

SubSync accepts CSV files with any of the following column headers:

| Column | Description | Example |
|--------|-------------|---------|
| `channel_id` | YouTube channel ID | `UCBcRF18a7Qf58cCRy5xuWwQ` |
| `channel_url` | Full channel URL | `https://www.youtube.com/channel/UCBcRF18a7Qf58cCRy5xuWwQ` |
| `channel_name` | Channel name (best-effort match) | `MKBHD` |

You can also use a single-column CSV with just channel IDs (one per line).

**Example `channels.csv`:**
```csv
channel_id,channel_name
UCBcRF18a7Qf58cCRy5xuWwQ,MKBHD
UCXuqSBlHAE6Xw-yeJA0Tunw,Linus Tech Tips
UCHnyfMqiRRG1u-2MsSQLbXA,Veritasium
```

---

## ⚠️ YouTube API Quotas

The YouTube Data API has a default quota of **10,000 units per day**.

| Action | Cost |
|--------|------|
| Subscribe to a channel | 50 units |
| Search for channels | 100 units |
| List subscriptions | 1 unit per page |

With the default quota, you can subscribe to approximately **200 channels per day**. If you need more, you can [request a quota increase](https://support.google.com/youtube/contact/yt_api_form) in the Google Cloud Console.

---

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **NextAuth.js** (Google OAuth 2.0)
- **YouTube Data API v3**
- **Vanilla CSS** (dark theme with glassmorphism)

---

## 📄 License

MIT
