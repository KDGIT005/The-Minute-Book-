# The Minute Book — Meeting Summarizer

Transcribe meeting audio and generate action-oriented summaries powered by AI.

Upload a recording → get a transcript with timestamps → receive an executive summary with key decisions and action items — all in one flow.

## Architecture

```
                 ┌─────────────────────────────────────────────┐
  audio file ───▶│  POST /api/meetings                         │
                 │  Spring Boot Controller                     │
                 └───────────────┬─────────────────────────────┘
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │  MeetingProcessingService (async)           │
                 │  1. save file → local disk                  │
                 │  2. status = TRANSCRIBING                   │
                 │  3. call Groq Whisper → transcript+timestamps│
                 │  4. status = SUMMARIZING                    │
                 │  5. Gemini prompt chain (A→B→C→D)           │
                 │  6. status = DONE                           │
                 └───────────────┬─────────────────────────────┘
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │  MySQL (meetings, transcript_segments,       │
                 │  key_decisions, action_items, chapters)      │
                 └───────────────┬─────────────────────────────┘
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │  React frontend — polls status, renders      │
                 │  Transcript / Summary / Action Items          │
                 └─────────────────────────────────────────────┘
```

### LLM Prompt Chain (4 Stages)

The summarization pipeline is **not** a single "summarize this" prompt. It's a deliberate multi-stage chain:

| Stage | Purpose | Technique |
|-------|---------|-----------|
| **A** | Chunk Summarization | Map step — each ~3000-token chunk gets 3-6 bullet points |
| **B** | Decision & Action Extraction | Structured JSON extraction with Gemini's JSON mode |
| **C** | Executive Summary | Reduce step — combines all chunk summaries + extracted data |
| **D** | Auto-Chapter Titling | Groups chunks into 3-6 topical chapters |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17 + Spring Boot 3.3.x |
| ASR | Groq API — `whisper-large-v3-turbo` |
| LLM | Google Gemini 2.5 Flash |
| Database | MySQL 8.0 |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 4 |

## Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Free API keys from [Groq](https://console.groq.com/) and [Google AI Studio](https://aistudio.google.com/)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/meeting-summarizer.git
cd meeting-summarizer
cp .env.example .env
# Edit .env with your API keys
```

### 2. Create the MySQL database

```sql
CREATE DATABASE minutebook;
```

### 3. Run the backend

```bash
cd backend
# Set environment variables or edit application.yml
export GROQ_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`. Flyway will auto-create all tables on first startup.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` with API requests proxied to the backend.

### Docker Compose (Alternative)

```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up
```

Access at `http://localhost:3000`.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/meetings` | Upload audio + title, starts async pipeline |
| GET | `/api/meetings` | List all meetings |
| GET | `/api/meetings/{id}` | Full detail with transcript, summary, action items |
| GET | `/api/meetings/{id}/status` | Poll processing status |
| PATCH | `/api/meetings/{id}/action-items/{itemId}` | Update/check off action item |
| GET | `/api/meetings/{id}/export?format=md\|json\|srt` | Export meeting |

## Known Limitations

- **No speaker diarization**: All segments are labeled "Speaker" — the MVP does not include a diarization sidecar. This could be added with `pyannote.audio` in a small FastAPI service.
- **No audio playback in UI**: The audio player UI is present but audio streaming from the backend is not implemented in the MVP. The file is stored on disk.
- **File size limit**: Files over 100MB will be rejected. Groq's API has a per-file limit — files over ~25 minutes should ideally be chunked.
- **Single-user**: No authentication — this is a local development tool.
- **MySQL instead of PostgreSQL**: Uses MySQL for local development convenience. Schema is identical, trivially portable.

## Project Structure

```
├── backend/                    # Spring Boot 3.3.x
│   ├── controller/             # REST endpoints (thin — no business logic)
│   ├── service/                # Business logic layer
│   │   ├── TranscriptionService   # Groq Whisper API integration
│   │   ├── SummarizationService   # 4-stage Gemini prompt chain
│   │   ├── MeetingProcessingService # Async orchestrator
│   │   ├── ExportService          # MD/JSON/SRT export
│   │   └── AudioStorageService    # Interface-first storage
│   ├── model/                  # JPA entities
│   ├── repository/             # Spring Data JPA
│   └── dto/                    # API response objects
├── frontend/                   # React 18 + TypeScript + Vite
│   ├── components/             # Reusable UI components
│   │   ├── LedgerSpine         # Timeline rail (signature element)
│   │   ├── UploadZone          # Drag-and-drop upload
│   │   └── ...
│   └── pages/                  # Route-level pages
├── docker-compose.yml          # MySQL + backend + frontend
└── .env.example                # API key placeholders
```
