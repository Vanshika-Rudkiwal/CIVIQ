# CIVIQ — Setup Guide
> Stop Missing. Start Claiming.  
> Team AETHERA — IGDTUW | HackArena 2.0

---

## What You're Getting
- Conversational AI interface (ChatGPT-style)
- 6-stage pipeline: Intake → Clarify → Match → Conflict → Effort → Action Plan
- 30 verified Indian government schemes database
- Deterministic rule-based eligibility engine (zero AI for decisions)
- Voice input + voice output
- PwD accessibility mode (WCAG 2.1 AA)
- PDF action plan download
- Firebase auth + Firestore profile storage

---

## Prerequisites
- Node.js 18+ (check: `node -v`)
- A Google account (for Firebase + Gemini)

---

## Step 1 — Get the Files
Copy the entire `civiq/` folder to your computer.

---

## Step 2 — Set Up Firebase

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `civiq` → Create
3. In your project, click **Authentication** → Get started → **Email/Password** → Enable → Save
4. Click **Firestore Database** → Create database → Start in **test mode** → Done
5. Click the **gear icon** → Project Settings → scroll to **Your apps** → click `</>` (Web)
6. Register app with nickname `civiq-web` → Copy the config values

---

## Step 3 — Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API key** → Copy it

---

## Step 4 — Create Environment File

In the `civiq/` folder, create a file called `.env.local` (copy from `.env.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civiq-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=civiq-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=civiq-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

GEMINI_API_KEY=AIzaSy...
```

Replace every value with your actual keys.

---

## Step 5 — Install & Run

Open terminal in the `civiq/` folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Step 6 — Test the Flow

1. Click **Get started** → Register with any email/password
2. You land on the dashboard chat
3. Type: *"I am a 2nd year BTech student from Delhi. Family income is 3 lakh. I am OBC."*
4. CIVIQ will ask for missing info (gender, PWD status, etc.)
5. Once profile is complete → schemes appear
6. Click **Download Action Plan PDF**

---

## Folder Structure

```
civiq/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Landing page
│   │   ├── login/page.tsx        ← Login
│   │   ├── register/page.tsx     ← Register
│   │   ├── dashboard/page.tsx    ← Main chat interface ⭐
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── chat/route.ts     ← 6-stage pipeline
│   │       ├── profile/route.ts  ← Firestore save/load
│   │       └── schemes/route.ts  ← Matcher + explanations
│   ├── components/
│   │   ├── SchemeCard.tsx        ← Scheme result card
│   │   └── AccessibilityToolbar.tsx
│   ├── lib/
│   │   ├── firebase.ts           ← Firebase init
│   │   ├── gemini.ts             ← AI (profile extract + explain only)
│   │   ├── matcher.ts            ← Deterministic eligibility engine ⭐
│   │   ├── pdf.ts                ← PDF generation
│   │   └── speech.ts             ← Voice input/output
│   ├── data/
│   │   └── schemes.json          ← 30 verified schemes
│   └── types/
│       ├── student.ts
│       └── scheme.ts
├── .env.local                    ← YOUR KEYS (create this)
├── .env.example                  ← Template
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Common Errors

| Error | Fix |
|---|---|
| `Firebase: Error (auth/...)` | Check your Firebase config in `.env.local` |
| `Gemini API error: 403` | Check your `GEMINI_API_KEY` in `.env.local` |
| `Module not found` | Run `npm install` again |
| Voice input not working | Use Chrome browser (Safari/Firefox limited support) |
| PDF download fails | Check browser popup blocker |

---

## Firestore Security Rules (before going live)

Replace test mode rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Architecture Notes

- **Gemini is ONLY used for:** profile extraction, clarification phrasing, plain-language explanations, PDF content
- **Gemini NEVER decides eligibility** — that's 100% deterministic rule-based logic in `matcher.ts`
- **Conflict detection** is hardcoded rules (NSP Central Sector ↔ State Post-Matric)
- **Effort scoring** is a field in `schemes.json` — no AI involved

---

## Team AETHERA
Vanshika · Saumya · Radha Yadav · Safa Fatima  
IGDTUW | HackArena 2.0
