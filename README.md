# ConstructLog

Paste any German construction meeting transcript (Besprechungsprotokoll) and get back a structured protocol in seconds: decisions, tasks, risks, and open questions — each grounded in a source quote from the original text.

---

## How it works

1. A transcript is submitted from the frontend to `/api/analyze`
2. The Vercel AI SDK's `generateObject` calls Claude with a Zod schema
3. Claude extracts structured data validated against the schema automatically
4. The frontend renders the results with source quotes for every item

**Tech stack:** Node.js · Express (local dev) · Vercel Serverless Functions · Vercel AI SDK · `@ai-sdk/anthropic` · Zod · Vanilla JS frontend

---

## Project structure

```
├── api/
│   └── analyze.js        # Vercel serverless function (POST /api/analyze)
├── lib/
│   └── schema.js         # Shared Zod schema + Claude system prompt
├── public/
│   └── index.html        # Static frontend served by Vercel
├── server.js             # Local dev server — wraps api/analyze.js in Express
├── vercel.json           # Vercel config
├── .env.example          # Required environment variables
└── package.json
```

---

## Local development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd constructlog
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.

### 3. Start the dev server

```bash
node server.js
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Beispiel laden**, and hit **Protokoll analysieren**.

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about the framework, select **Other**.

Then add your API key as an environment variable:

```bash
vercel env add ANTHROPIC_API_KEY
# paste your sk-ant-... key when prompted
# select: Production, Preview, Development
```

Redeploy to pick up the variable:

```bash
vercel --prod
```

### Option B — Vercel Dashboard (GitHub integration)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Project Settings → Environment Variables**, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`
   - Environments: Production, Preview, Development
4. Click **Deploy**

Vercel auto-detects the `api/` folder and serves `public/index.html` as the root — no additional config needed beyond `vercel.json`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (`sk-ant-...`) |
| `PORT` | No | Local dev port (default: `3000`) |

---

## API reference

### `POST /api/analyze`

Analyzes a construction meeting transcript and returns structured protocol data.

**Request body**

```json
{
  "transcript": "BESPRECHUNGSPROTOKOLL\nProjekt: ..."
}
```

**Response**

```json
{
  "summary": "Kurze Zusammenfassung der Besprechung.",
  "decisions": [
    {
      "text": "Die Nassbohrung wird fortgeführt.",
      "owner": "Herr Roth",
      "rationale": "Grundwasser wurde früher als erwartet angetroffen.",
      "source": "Beschluss: Die Nassbohrung wird fortgeführt."
    }
  ],
  "tasks": [
    {
      "text": "Nachtragsantrag einreichen",
      "owner": "Herr Roth",
      "deadline": "17.04.2026",
      "source": "Thomas, submit the change order by April 17th."
    }
  ],
  "risks": [
    {
      "text": "Möglicher Baustopp durch Gemeinde bei weiteren Lärmbeschwerden",
      "severity": "high",
      "source": "Ein Wiederholungsfall würde zu einem behördlich angeordneten Baustopp führen."
    }
  ],
  "open_questions": [
    {
      "text": "Handlungsoptionen falls Übergabetermin 15.06.2026 nicht gehalten werden kann",
      "source": "Welche Handlungsoptionen stehen zur Verfügung, falls der Übergabetermin nicht zu halten ist?"
    }
  ]
}
```

**Error responses**

| Status | Meaning |
|---|---|
| `400` | Missing `transcript` in request body |
| `405` | Method not allowed (only POST accepted) |
| `500` | `ANTHROPIC_API_KEY` not set, or Claude API error |

---

## Design principles

**Transparency over magic.** Every extracted item includes the source quote it came from. Nothing is invented — the model is constrained by a Zod schema and instructed to cite the original text for every field.

**Single handler, two environments.** `api/analyze.js` runs identically on Vercel and locally via `server.js` — no environment-specific code paths.

**Schema as contract.** The Zod schema in `lib/schema.js` is the single source of truth shared between the API handler and the type system. The Vercel AI SDK passes the schema's `.describe()` hints directly to Claude, removing the need for a separate JSON format prompt.
