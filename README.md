# 🎯 Elevate AI Interviewer

<div align="center">

![Elevate AI Interviewer](https://img.shields.io/badge/Elevate-AI%20Interviewer-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991?style=for-the-badge&logo=openai)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack, AI-powered mock interview platform that evaluates candidates across technical knowledge, communication, and coding skills — with real-time proctoring.**


</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#️-project-structure)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [Interview Flow](#-interview-flow)
- [Tech Stack](#️-tech-stack)
- [Environment Variables](#-environment-variables-reference)
- [API Routes](#-api-routes)
- [Proctoring & Integrity](#-proctoring--integrity)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📖 Overview

**Elevate AI Interviewer** is an intelligent interview simulation platform built to help developers and students prepare for real-world technical interviews. It uses **OpenAI** to dynamically generate questions tailored to your resume, evaluate your answers in real time, assess your spoken English communication, review your code solutions, and produce a comprehensive performance report — all in one seamless session.

The platform covers every dimension of a modern technical interview:

| Phase | Description |
|-------|-------------|
| 📄 Resume Parsing | Upload or paste your resume; AI parses skills, projects & experience |
| 💬 Q&A Round | 10–20 adaptive technical, project, and behavioral questions |
| 🎙️ Voice Round | 5 JAM (Just A Minute) spoken English assessments |
| 💻 Coding Round | 2 real coding challenges with live code execution |
| 📊 Feedback Report | Detailed scored report with strengths, weaknesses & improvement tips |

---

## ✨ Features

### 🤖 AI-Powered Interview Engine
- **Resume-Aware Question Generation** — questions are dynamically generated from your actual skills, projects, and experience using a curated skill database (React, Next.js, Python, Django, Node.js, Docker, AWS, and many more)
- **4-Section Question Bank** — Technical Fundamentals, Skills Deep Dive, Project Deep Dive, and Behavioral/HR questions
- **Real-time Answer Evaluation** — each answer is scored (Correct / Partial / Incorrect) with AI-generated explanations
- **Configurable Question Count** — choose between 10 or 20 questions per session

### 🎙️ Voice Communication Assessment
- **Speech-to-Text** using the Web Speech API (continuous, real-time transcription)
- **AI Evaluation** of spoken responses across:
  - Fluency Score
  - Pronunciation Score
  - Grammar Score
  - Structure/Coherence Score
  - Words Per Minute (WPM)
  - Mispronounced Words Detection
- **Text-to-Speech** — an AI voice reads out each question using the Speech Synthesis API

### 💻 Coding Round
- **Live In-Browser Code Editor** powered by CodeMirror 6 with syntax highlighting
- **Multi-Language Support** — JavaScript, Python, C, C++, C#, Java
- **Real Code Execution** via a secure server-side sandbox
- **AI Code Review** — evaluates correctness, time/space complexity, and code quality
- **Optimal Solution Reveal** — shows the ideal solution after submission

### 🛡️ Proctoring System
- **Screen Share Monitoring** — requires active screen share throughout the interview
- **Fullscreen Enforcement** — interview pauses if the user exits fullscreen
- **Tab Switch Detection** — tracks and penalizes switching away from the interview
- **Time Away Tracking** — logs total seconds spent away from the interview window
- **Integrity Score** — factored into the final assessment report
- **Auto-Pause & Resume** — interview pauses on violation and resumes only after correction

### 📊 Comprehensive Feedback Report
- **Overall Score** (0–100) with weighted category breakdown
- **Radar Chart Visualization** across all categories: Technical Knowledge, Project Understanding, HR/Behavioral, Communication, Coding
- **Strengths & Weaknesses** summary
- **Actionable Improvement Tips**
- **Communication Details** — WPM, filler words, mispronounced words, improvement exercises
- **Coding Details** — per-problem correctness, complexity analysis, optimal solution
- **Integrity Report** — proctoring event log (fullscreen exits, tab switches, time away)
- **Confetti Celebration** on report completion (unless disqualified)
- **Shareable Reports** — each interview gets a unique ID and can be shared via URL

### 🔐 Authentication System
- **JWT-based Auth** using `jose` (HS256, 7-day expiry)
- **Password Hashing** with `bcryptjs`
- **User Registration & Login** with validation
- **Session Persistence** via HTTP-only cookies
- **Protected Routes** — unauthenticated users are redirected to login

### 🗄️ Dual Database Architecture
- **Primary: MySQL** — full relational schema with connection pooling (`mysql2`)
- **Fallback: In-Memory DB** — automatically activates if MySQL is unavailable, ensuring zero-downtime development
- **Auto Schema Migration** — tables are created automatically on first connection
- **Interview History Dashboard** — users can view all past interview reports

### 🎨 UI & UX
- **Dark / Light Theme** toggle with `next-themes`
- **Smooth Animations** with `framer-motion` on every transition
- **Animated Gradient Background** and floating particle effects
- **Glassmorphism Cards** and modern component design via ShadCN UI
- **Responsive Design** with TailwindCSS v4
- **Typing Indicator** while AI is generating responses
- **Per-Answer Verdict Badges** (Correct / Partial / Incorrect)
- **60-second per-question Timer** in the Q&A round
- **Sample Resumes** (Frontend & Backend profiles) for quick demo/testing

---

## 🏗️ Project Structure

```
elevate-ai-interviewer/
├── app/
│   ├── api/
│   │   ├── analyze-speech/     # Voice response AI evaluation
│   │   ├── auth/
│   │   │   ├── login/          # User login endpoint
│   │   │   ├── logout/         # Session invalidation
│   │   │   ├── me/             # Current user info
│   │   │   └── register/       # User registration
│   │   ├── evaluate-answer/    # Q&A answer scoring
│   │   ├── evaluate-code/      # Code submission review
│   │   ├── extract-text/       # PDF/DOCX text extraction
│   │   ├── feedback/           # Final report generation
│   │   ├── get-interview/      # Fetch saved interview by ID
│   │   ├── interview/          # Main interview chat API
│   │   ├── interviews/         # List all user interviews
│   │   ├── parse-resume/       # Resume parsing & question generation
│   │   └── save-interview/     # Persist interview results
│   ├── login/                  # Login / Register page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout with theme provider
│   └── page.tsx                # Main interview application (all phases)
│
├── components/
│   ├── ui/
│   │   ├── button.tsx          # ShadCN Button component
│   │   ├── card.tsx            # ShadCN Card component
│   │   └── input.tsx           # ShadCN Input component
│   ├── animated-background.tsx # Gradient animated background
│   ├── chat-message.tsx        # Chat bubble component
│   ├── code-editor.tsx         # CodeMirror-based code editor
│   ├── feedback-report.tsx     # Full assessment report UI
│   ├── floating-leaves.tsx     # Decorative particle animation
│   ├── proctoring-overlay.tsx  # Proctoring pause/alert overlay
│   ├── theme-toggle.tsx        # Dark/Light mode toggle
│   └── typing-indicator.tsx    # AI typing animation
│
├── hooks/
│   ├── useSpeech.ts             # Web Speech API (STT) hook
│   ├── useSpeechSynthesis.ts    # Speech Synthesis (TTS) hook
│   └── useProctoring.ts         # Proctoring & integrity tracking hook
│
├── lib/
│   ├── auth.ts                          # JWT sign/verify, user session helpers
│   ├── db.ts                            # MySQL pool + in-memory fallback DB
│   ├── dynamic-question-generator.ts    # Resume-to-question mapping engine
│   ├── executeCode.ts                   # Server-side code execution sandbox
│   └── utils.ts                         # Utility functions
│
├── public/                     # Static assets
├── Dockerfile                  # Docker container configuration
├── docker-compose.yml          # Multi-container setup (app + MySQL)
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **pnpm**
- **MySQL** 8.x *(optional — the app falls back to an in-memory DB)*
- **OpenAI API Key**

### 1. Clone the Repository

```bash
git clone https://github.com/ponraj056/elevate-ai-interviewer.git
cd elevate-ai-interviewer
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# MySQL Database (optional — app works without it using in-memory fallback)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=elevate_interviewer
MYSQL_PORT=3306

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this
```

> **Note:** If the `MYSQL_*` variables are not set or MySQL is unreachable, the app automatically uses an in-memory database. All features still work — data simply resets on server restart.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

Run the full stack (app + MySQL) with Docker Compose:

```bash
docker-compose up --build
```

This starts:
- **Next.js App** on port `3000`
- **MySQL 8** on port `3306`

---

## 🧪 Interview Flow

```
Login / Register
       │
       ▼
   Dashboard  ──────── View Past Interview Reports
       │
       ▼
   Setup Phase
   (Screen share + Fullscreen + Mic permissions)
       │
       ▼
 Phase 0: Resume Input
   (Upload PDF/DOCX or paste text or pick a sample resume)
       │
       ▼
 Phase 1: Q&A Round (10 or 20 questions, 60s timer each)
   ├── Technical Fundamentals
   ├── Skills Deep Dive (based on your resume skills)
   ├── Project Deep Dive (based on your projects)
   └── Behavioral / HR
       │
       ▼
 Phase 2: Voice Round (5 JAM prompts, spoken answers)
   └── AI evaluates: Fluency, Pronunciation, Grammar, Structure, WPM
       │
       ▼
 Phase 3: Coding Round (2 problems)
   ├── Reverse String (Easy)
   └── Two Sum (Medium)
       │
       ▼
 Phase 4: Feedback Walkthrough
   └── Incorrect/partial answers reviewed with ideal answers
       │
       ▼
 Completed Report
   └── Overall score, radar chart, strengths/weaknesses, tips, integrity log
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.6 (App Router) |
| **Language** | TypeScript 5.7.3 |
| **Styling** | TailwindCSS v4, ShadCN UI |
| **Animations** | Framer Motion |
| **AI / LLM** | OpenAI SDK v6 (GPT models) |
| **Code Editor** | CodeMirror 6 |
| **Charts** | Recharts (Radar Chart) |
| **Speech (STT)** | Web Speech API |
| **Speech (TTS)** | Speech Synthesis API |
| **Auth** | JWT (`jose`) + `bcryptjs` |
| **Database** | MySQL 2 (with in-memory fallback) |
| **File Parsing** | `pdf-parse` (PDF), `mammoth` (DOCX) |
| **Containerization** | Docker + Docker Compose |
| **Analytics** | Vercel Analytics |

---

## 🌍 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | Your OpenAI API key |
| `MYSQL_HOST` | No | `localhost` | MySQL server host |
| `MYSQL_USER` | No | `root` | MySQL username |
| `MYSQL_PASSWORD` | No | `` | MySQL password |
| `MYSQL_DATABASE` | No | `elevate_interviewer` | Database name |
| `MYSQL_PORT` | No | `3306` | MySQL port |
| `JWT_SECRET` | No | (default key) | Secret for signing JWT tokens |

---

## 📡 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/parse-resume` | Parse resume and generate question bank |
| `POST` | `/api/extract-text` | Extract text from uploaded PDF/DOCX |
| `POST` | `/api/interview` | AI interview chat (Q&A phase) |
| `POST` | `/api/evaluate-answer` | Score a single Q&A answer |
| `POST` | `/api/analyze-speech` | Evaluate a voice response |
| `POST` | `/api/evaluate-code` | Review a code submission |
| `POST` | `/api/feedback` | Generate final interview report |
| `POST` | `/api/save-interview` | Persist interview to database |
| `GET` | `/api/interviews` | List all interviews for current user |
| `GET` | `/api/get-interview?id=` | Fetch a specific interview report |

---

## 🔒 Proctoring & Integrity

The platform implements a lightweight proctoring system to ensure interview integrity:

| Event | Action |
|-------|--------|
| Exit Fullscreen | Interview paused, counter incremented |
| Tab Switch / Window Blur | Interview paused, counter incremented |
| Screen Share Stopped | Interview paused, marked as interrupted |
| Resume | User must re-enter fullscreen / re-share screen |
| Final Report | All events summarized in the Integrity section |

> Disqualification is triggered if violations exceed configured thresholds.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Ponraj** — [@ponraj056](https://github.com/ponraj056)

---

<div align="center">

Made with ❤️ to help developers ace their interviews.

**⭐ Star this repo if you find it helpful!**

</div>
