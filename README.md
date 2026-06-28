# BitBrew — AI Brand Visibility Platform

**Live:** [bitbrew.pl](https://bitbrew.pl)

BitBrew is a SaaS platform that audits how a brand appears across AI assistants and AI-powered search. It runs structured visibility audits, scores a brand's presence, and surfaces actionable insights — grounding every analysis in brand-specific context through a retrieval pipeline.

Designed, built, and shipped **solo**, from idea to production.

---

## What it does

- Runs AI brand-visibility audits and returns structured scores and insights
- Grounds each analysis in brand-specific knowledge via a RAG pipeline (more accurate, fewer hallucinations)
- Handles user accounts, subscriptions, and billing end-to-end

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Netlify serverless functions, REST APIs |
| Data & Auth | Supabase — PostgreSQL, Auth, Row-Level Security, Storage |
| AI / Retrieval | Anthropic Claude API, RAG (Supabase pgvector + embeddings) |
| Payments | Stripe — checkout + webhook-driven plan upgrades |
| Infra | Netlify CI/CD, custom domain & DNS, Google OAuth |

## Engineering highlights

- Designed and implemented a **RAG pipeline** (pgvector + embeddings) to inject relevant brand context into LLM prompts
- Built **serverless functions** for LLM calls, vector search, and Stripe webhooks
- Implemented **auth and row-level security** so every user only accesses their own data
- Set up **CI/CD and a custom domain**, and debugged production issues across the full stack (auth, serverless runtime, third-party APIs)

## Screenshots

<img width="1240" height="1009" alt="Opera Zrzut ekranu_2026-06-28_131506_bitbrew pl" src="https://github.com/user-attachments/assets/e45238ef-7152-431c-853a-151ef7202f15" />
<img width="1257" height="914" alt="Opera Zrzut ekranu_2026-06-28_131713_bitbrew pl" src="https://github.com/user-attachments/assets/4cb08a9f-598a-4552-b469-a5f44e9ecc44" />
<img width="1056" height="702" alt="Opera Zrzut ekranu_2026-06-28_131819_bitbrew pl" src="https://github.com/user-attachments/assets/c0675723-40ee-4cb7-8321-bf9020e7a10f" />




![BitBrew dashboard](docs/dashboard.png)

---

## About

Built by **Patryk Rybacki** — Junior Full-Stack Developer (React · TypeScript · Node.js).

- Live product: [bitbrew.pl](https://bitbrew.pl)
- LinkedIn: [patryk-rybacki](https://linkedin.com/in/patryk-rybacki-503599355)
