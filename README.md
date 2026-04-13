# DocuMind — Intelligent Document Analysis Platform

DocuMind is a full-stack application that lets users upload PDF documents and query them using natural language. It implements a Retrieval-Augmented Generation (RAG) pipeline — chunking documents, generating embeddings, performing semantic search, and streaming AI-powered answers in real time.

---

## 🚀 Features

- **PDF Upload & Processing** — Drop in any PDF and DocuMind extracts, chunks, and indexes the content automatically
- **Semantic Search** — Questions are embedded and matched against document chunks using cosine similarity
- **Streamed AI Responses** — Answers stream token-by-token using Gemini, providing a real-time chat experience
- **Chat History** — All Q&A pairs are persisted and restored across sessions
- **Firebase Authentication** — Secure Google & email/password login with per-user document isolation
- **Per-User Rate Limiting** — 2 LLM queries per hour to protect API key usage
- **Deploy-Ready** — Configured for Vercel (frontend) + Render (backend) with environment-based configuration

---

## 🧠 System Architecture

```
Frontend (React + Vite)  →  Firebase Auth  →  Backend (Express.js)
                                                  ↓
                                        PDF Upload → Text Extraction → Chunking → Embeddings
                                                  ↓
                                          PostgreSQL (Neon DB)
                                                  ↓
                                   Query → Embedding → Similarity Search → Gemini LLM → Streamed Response
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Auth** | Firebase Authentication (Google + Email/Password) |
| **AI / ML** | Gemini API (Embeddings + Generation) |
| **Database** | PostgreSQL (Neon DB) via Drizzle ORM |
| **File Processing** | Multer (memory storage), pdf-parse |
| **Security** | Helmet, CORS, Firebase Admin SDK, express-rate-limit |

---

## 🗄️ Database Schema

### Users
| Column | Type |
|--------|------|
| `id` | TEXT (Firebase UID) |
| `email` | TEXT |
| `name` | TEXT |
| `created_at` | TIMESTAMP |

### Documents
| Column | Type |
|--------|------|
| `id` | UUID |
| `name` | TEXT |
| `user_id` | TEXT (FK → Users) |
| `uploaded_at` | TIMESTAMP |

### Chunks
| Column | Type |
|--------|------|
| `id` | UUID |
| `document_id` | UUID (FK → Documents) |
| `content` | TEXT |
| `embedding` | JSON |

### Chats
| Column | Type |
|--------|------|
| `id` | UUID |
| `document_id` | UUID (FK → Documents) |
| `question` | TEXT |
| `response` | TEXT |
| `created_at` | TIMESTAMP |

---

## 📡 API Endpoints

All routes (except `/`) require a valid Firebase ID token in the `Authorization: Bearer <token>` header.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/history` | Fetch user's latest document and chat history |
| `POST` | `/api/upload` | Upload a PDF — extracts, chunks, embeds, and stores |
| `POST` | `/api/query` | Ask a question — streams the LLM response in real time |

### Query Body
```json
{
  "documentId": "uuid",
  "question": "What does section 3 say about compliance?"
}
```

---

## 🔄 Pipeline

### Ingestion
```
PDF Upload → Text Extraction → Chunking (400 chars, 100 overlap) → Embedding (Gemini) → PostgreSQL
```

### Retrieval
```
User Query → Embed Query → Cosine Similarity vs Stored Chunks → Top 3 Chunks → Gemini LLM → Streamed Response
```

---

## 🧪 Running Locally

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database
- A Firebase project with Authentication enabled
- A Gemini API key

### Backend
```bash
cd backend
npm install
# Create .env with: DATABASE_URL, GEMINI_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
npm start
```

### Frontend
```bash
cd frontend
npm install
# Create .env with: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, etc.
npm run dev
```

---

## 🌐 Deployment

| Component | Platform | Start Command |
|-----------|----------|---------------|
| Frontend | Vercel | Auto-detected (Vite) |
| Backend | Render | `npm start` → `node index.js` |

### Environment Variables

**Render (Backend):** `DATABASE_URL`, `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FRONTEND_URL`

**Vercel (Frontend):** `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

---

## ⚠️ Limitations

- PDF extraction may produce noisy text from complex layouts
- No OCR support for scanned/image-based PDFs
- Linear similarity search (not optimized for millions of chunks)
- Single-document context per session

---

## 🚀 Future Improvements

- Vector database integration (pgvector / Pinecone) for faster retrieval at scale
- Multi-document querying across an entire knowledge base
- Async processing with job queues for large document uploads
- OCR support for scanned documents
- Markdown rendering for AI responses

---

## 💡 Key Learnings

- Built an end-to-end RAG pipeline from scratch without high-level abstractions
- Implemented streaming LLM responses from backend to frontend using chunked transfer encoding
- Designed a secure multi-tenant system with Firebase Auth + per-user data isolation
- Explored trade-offs in chunking strategies, embedding models, and retrieval methods

---

## 📌 Summary

DocuMind demonstrates how unstructured documents can be transformed into queryable knowledge systems using modern AI techniques. The project focuses on practical system design — retrieval logic, streaming architecture, authentication, and production deployment — rather than relying on off-the-shelf RAG frameworks.
