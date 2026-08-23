<div align="center">

# 📖 The Minute Book
### *Every meeting, kept like a ledger.*

An executive-grade AI meeting summarizer and transcription suite. Upload recorded conversations and transform unstructured audio into timestamped transcripts, definitive decisions, and actionable task checklists.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-the--minute--book.workers.dev-2F6E52?style=for-the-badge&logo=cloudflare&logoColor=white)](https://the-minute-book.kuldeepdhangad6.workers.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq Whisper](https://img.shields.io/badge/Groq-Whisper%20v3-F55036?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-B8791E?style=for-the-badge)](LICENSE)

---

### 🌐 [**🚀 Live Application: https://the-minute-book.kuldeepdhangad6.workers.dev/**](https://the-minute-book.kuldeepdhangad6.workers.dev/)

</div>

---

## ☁️ Cloud Architecture & Deployment

This project is deployed across a modern, decoupled cloud infrastructure:

| Component | Cloud Platform | Architecture & Technology |
|:---|:---|:---|
| **Frontend UI** | **Cloudflare Workers / Pages** | React 18 + Vite + TypeScript + Tailwind CSS (Edge Global CDN) |
| **Backend API** | **Render.com** | Java 21 + Spring Boot 3.3 REST API (Containerized Async Service) |
| **Database** | **TiDB Cloud Serverless** | Managed Cloud MySQL 8.0 with automated Flyway Schema Migrations |
| **ASR (Speech-to-Text)** | **Groq Cloud** | `whisper-large-v3-turbo` with sub-second audio transcription & word timestamps |
| **LLM Engine** | **Google AI Studio** | `gemini-2.5-flash` with 4-Stage Map-Reduce prompt chain |

---

## ✨ Features at a Glance

- **🎨 Editorial Design System**: Built with `shadcn/ui` primitives, tailored to a bespoke publishing palette (*Paper `#F8F6F0`, Ink `#20262E`, Ledger Green `#2F6E52`, Seal Amber `#B8791E`*) and editorial typography (*Fraunces*, *Public Sans*, *IBM Plex Mono*).
- **🌊 Signature Waveform-to-Ledger Visual**: Interactive two-panel animation visualizing raw audio turning into a structured ledger entry.
- **📍 Narrative Ledger Spine**: Vertical timeline rail that tracks meeting progression, timestamped chapters, decisions, and tasks.
- **⚡ Ultra-Fast ASR**: Powered by **Groq's `whisper-large-v3-turbo`** for near real-time, highly accurate speech-to-text with segment timestamps.
- **🧠 4-Stage LLM Prompt Chain**: Uses **Google Gemini 2.5 Flash** with chunked Map-Reduce synthesis for deep, comprehensive executive summaries without artificial length truncations.
- **✅ Action Items & Decisions Tracker**: Interactive checklist with priority flags, deadlines, and task owners extracted directly from dialogue.
- **📥 Multi-Format Export**: One-click download of meeting minutes in **Markdown (`.md`)**, **JSON (`.json`)**, and **Subtitles (`.srt`)**.

---

## 🏛️ System Architecture

```
                  ┌─────────────────────────────────────────────┐
   Audio File ───▶│  POST /api/meetings                         │
                  │  Spring Boot REST Controller                │
                  └───────────────┬─────────────────────────────┘
                                  ▼
                  ┌─────────────────────────────────────────────┐
                  │  MeetingProcessingService (Async Engine)    │
                  │  1. Ingest audio → Local Storage            │
                  │  2. Status = TRANSCRIBING                   │
                  │  3. Groq Whisper ASR → Timestamped Segments │
                  │  4. Status = SUMMARIZING                    │
                  │  5. Gemini LLM Chain (Stages A → B → C → D) │
                  │  6. Status = DONE                           │
                  └───────────────┬─────────────────────────────┘
                                  ▼
                  ┌─────────────────────────────────────────────┐
                  │  MySQL 8.0 (Flyway Migrations)              │
                  │  Meetings · Transcripts · Decisions · Tasks │
                  └───────────────┬─────────────────────────────┘
                                  ▼
                  ┌─────────────────────────────────────────────┐
                  │  React 18 + Vite Frontend                   │
                  │  Landing Page · Dashboard · Detail & Spine  │
                  └─────────────────────────────────────────────┘
```

---

## 🔬 4-Stage LLM Synthesis Pipeline

Rather than relying on a single naive prompt, The Minute Book runs a structured 4-stage pipeline using Google Gemini 2.5 Flash:

| Stage | Name | Role & Methodology |
|:---:|:---|:---|
| **Stage A** | **High-Fidelity Chunk Synthesis** | *Map Step* — Reads transcript in overlapping 12,000-char chunks, extracting detailed arguments, narrative context, names, and facts. |
| **Stage B** | **Structured Entity Extraction** | *JSON Mode* — Extracts concrete decisions, owners, deadlines, and priority levels using strict JSON schema without hallucinated placeholders. |
| **Stage C** | **Executive Synthesis** | *Reduce Step* — Synthesizes chunk summaries into a structured, executive-grade multi-paragraph overview with discussion breakdowns. |
| **Stage D** | **Topical Chapter Segmentation** | *Chronological Indexing* — Groups meeting blocks into 3–6 titled chapters with exact timecodes for audio scrubbing. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Variables
- **Component Library**: shadcn/ui primitives (`Button`, `Card`, `Badge`, `Separator`, `Slot`)
- **Typography**: Fraunces (Display), Public Sans (Body), IBM Plex Mono (Timestamps)
- **Icons**: Lucide React

### Backend
- **Framework**: Java 17 + Spring Boot 3.3.x
- **ASR Model**: Groq Whisper API (`whisper-large-v3-turbo`)
- **LLM Engine**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Database**: MySQL 8.0 with Flyway schema versioning
- **Client**: Spring Boot `RestClient` & Jackson JSON Engine

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** & **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MySQL 8.0**
- Free API keys from [Groq Console](https://console.groq.com/) and [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone & Configure

```bash
# Clone the repository
git clone https://github.com/KDGIT005/The-Minute-Book-.git
cd The-Minute-Book-

# Create local environment configuration
cp .env.example .env
```

Open `.env` and provide your API keys:

```env
# Required API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=minutebook
DB_USER=root
DB_PASSWORD=your_mysql_password
```

---

### 2. Database Setup

Create the MySQL database (Flyway automatically creates all required tables on first backend run):

```sql
CREATE DATABASE minutebook;
```

---

### 3. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on `http://localhost:8080`.

---

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start on `http://localhost:5173`.

---

### 🐳 Run via Docker Compose (One-Click)

```bash
# Provide your keys in .env, then launch all services:
docker-compose up --build
```

Access the application at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/meetings` | Upload an audio file (`multipart/form-data`) and start background analysis |
| `GET` | `/api/meetings` | List all processed meetings |
| `GET` | `/api/meetings/{id}` | Retrieve full meeting detail (transcript, summary, decisions, action items) |
| `GET` | `/api/meetings/{id}/status` | Poll asynchronous processing status (`QUEUED` → `TRANSCRIBING` → `SUMMARIZING` → `DONE`) |
| `PATCH` | `/api/meetings/{id}/action-items/{itemId}` | Update task status, toggle completion, or reassign owner |
| `GET` | `/api/meetings/{id}/export?format={md\|json\|srt}` | Download formatted meeting export |
| `DELETE` | `/api/meetings/{id}` | Delete a meeting record and its audio data |

---

## 📂 Project Structure

```
The-Minute-Book-/
├── backend/                             # Spring Boot 3.3 Backend
│   ├── src/main/java/com/minutebook/
│   │   ├── config/                      # WebConfig (CORS), RestClient, Async
│   │   ├── controller/                  # REST API Endpoints
│   │   ├── dto/                         # Request & Response Data Objects
│   │   ├── model/                       # JPA Entities (Meeting, Transcript, Decision)
│   │   ├── repository/                  # Spring Data Repositories
│   │   └── service/                     # Audio, Transcription, Summarization, Processing
│   └── src/main/resources/
│       ├── application.yml              # Parameterized Spring Configuration
│       └── db/migration/                # Flyway SQL Migrations (V1__init_schema.sql)
├── frontend/                            # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/                 # Hero, HeroTransformGraphic, HowItWorks, FeatureColumns
│   │   │   ├── ui/                      # shadcn primitives (Button, Card, Badge, Separator)
│   │   │   ├── LedgerSpine.tsx          # Signature timeline spine
│   │   │   └── SummaryView.tsx          # Formatted Markdown executive view
│   │   ├── pages/                       # LandingPage, DashboardPage, UploadPage, MeetingDetailPage
│   │   └── index.css                    # Design system tokens & animations
├── docker-compose.yml                   # Containerized MySQL + Backend + Frontend
├── .env.example                         # Safe template for environment variables
└── README.md                            # Documentation
```

---

## 👨‍💻 Author

**Kuldeep Dhangad**  
- GitHub: [@KDGIT005](https://github.com/KDGIT005)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

