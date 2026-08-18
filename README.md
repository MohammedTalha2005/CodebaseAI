# ⚡ Codebase AI Engineer

> **AI-Powered Repository Intelligence & Code Understanding Engine**  
> Perform semantic code search, RAG-grounded Q&A, and interactive dependency graph visualization for any codebase.

---

## 🌟 Overview

**Codebase AI Engineer** turns complex codebases into interactive, searchable, and queryable intelligence graphs. Powered by Retrieval-Augmented Generation (RAG), AST parsing, and vector embeddings, it allows developers to effortlessly navigate, analyze, and query any software repository in natural language.

Key benefits:
- 🚀 **Onboard Faster**: Quickly understand unfamiliar codebases and legacy projects.
- 🔍 **Semantic Code Search**: Find logic by intent and behavior, not just string matching.
- 🧠 **Context-Aware AI Assistant**: Ask questions grounded directly in exact file snippets and AST symbols.
- 🕸️ **Dependency Visualization**: Map out package imports, class inheritance, and file relationships visually.

---

## 🖼️ User Interface

The web interface includes:
- 📊 **Repository Overview & Status**: Live health check monitors, vector count, and indexing progress.
- 🤖 **AI Code Assistant (RAG Chatbot)**: Interactive chat grounded in exact repository file snippets.
- 🔍 **Semantic Code Search**: Natural language search across code logic with relevance scores and symbol citations.
- 📁 **Repository Explorer**: Live file tree navigation and code viewer.
- 🕸️ **Dependency Graph**: Visual module dependency structure.

---

## ✨ Features

- **⚡ Semantic Vector Search**: Powered by Pinecone vector storage and dense code embeddings. Search code by intent and concept (e.g. *"where do we handle errors?"*), finding relevant logic even if exact keywords aren't in function names.
- **🌳 AST-Aware Code Chunker**: Intelligently parses Python functions, classes, and code blocks rather than arbitrary text splits.
- **🕸️ Interactive Dependency Graph**: Generates structural module dependency graphs using NetworkX.
- **🎨 Modern Dark Dashboard**: High-performance UI built with React, TypeScript, Vite, and Tailwind CSS.
- **📁 File Explorer & Status Monitor**: Live indexing stats, health check monitors, and direct file tree navigation.

---

## 🏗️ Architecture

```
                      ┌───────────────────────────────┐
                      │    React + TypeScript UI      │
                      │    (Vite / TanStack / Tailwind)│
                      └───────────────┬───────────────┘
                                      │ HTTP / REST API
                                      ▼
                      ┌───────────────────────────────┐
                      │      FastAPI Backend Server   │
                      │         (server.py)           │
                      └───────────────┬───────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
  │   Scanner & AST   │     │  Vector Store &   │     │   RAG Engine &    │
  │     Parser        │     │  Pinecone Index   │     │   LLM Providers   │
  │ (codebase_ai/...) │     │(SentenceTransform)│     │ (Gemini/OpenAI/Groq│
  └───────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## 📋 Prerequisites

Before running the project, ensure you have installed:

| Tool | Version Required | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.10+` | Backend API & Ingestion Engine |
| **Node.js** | `18.0+` | Frontend Web Dashboard |
| **npm** | `9.0+` | Node Package Manager |

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory of the project:

```env
# Vector Database (Required)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=codebase-ai

# LLM Providers (Provide at least ONE API Key)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

### 🆓 How to Get Free API Keys:
- **Pinecone**: [app.pinecone.io](https://app.pinecone.io) *(Free tier available)*
- **Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) *(Free tier available)*
- **Groq**: [console.groq.com/keys](https://console.groq.com/keys) *(Free tier available)*
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Codebase-AI-Engineer.git
cd "Codebase AI Engineer"
```

### 2. Backend Setup (Python)
```bash
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install required Python packages
pip install -r requirements.txt
```

### 3. Frontend Setup (Node.js)
```bash
# Navigate to frontend folder and install dependencies
cd frontend
npm install
cd ..
```

---

## 🖥️ Running the Application

Open **two separate terminal windows** in the project root folder:

### **Terminal 1 — Start Backend Server**
```bash
.venv\Scripts\activate      # (Or source .venv/bin/activate on Mac/Linux)
python server.py
```
> Backend runs at: `http://localhost:8000`

### **Terminal 2 — Start Frontend Dashboard**
```bash
cd frontend
npm run dev
```
> Frontend runs at: `http://localhost:8080`

### **Access the Dashboard**
Open your browser and navigate to: **[http://localhost:8080](http://localhost:8080)**

---

## 📖 How to Use

1. **Index a Codebase**:
   - Click **"Re-index Repository"** in the top right header or on the Overview page.
   - Enter **ANY of the following**:
     - 🐙 **GitHub Repository URL**: Paste a public GitHub link (e.g., `https://github.com/pallets/flask` or `https://github.com/your-username/your-repo`). The app will automatically clone and index it!
     - 💻 **Local Folder Path**: Enter `./` to index this project, or provide an absolute path to any local project folder on your machine (e.g., `C:\Users\YourName\Projects\my-app` on Windows or `/Users/yourname/projects/my-app` on Mac/Linux).
2. **Ask the AI Assistant**:
   - Go to **AI Code Assistant** in the sidebar.
   - Ask natural language questions grounded in your repository (e.g., *"How does the AST parser work?"* or *"Where is the vector database client configured?"*).
3. **Semantic Code Search**:
   - Go to **Semantic Search** to search for code by **concept and intent** (e.g., *"how are embeddings generated?"* or *"where do we handle errors?"*). It finds relevant functions even if your exact keywords aren't in the source code!
4. **Explore Dependencies**:
   - Go to **Repository Explorer** to visually inspect file structures and module dependency graphs.

---

## 📁 Repository Structure

```text
Codebase AI Engineer/
├── server.py                   # FastAPI REST API Backend Entrypoint
├── main.py                     # CLI Entrypoint
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (API keys)
│
├── codebase_ai/                # Core AI Engine Package
│   ├── pipeline.py             # RAG & Ingestion orchestrator
│   ├── scanner/                # Codebase file discovery & Git filter
│   ├── parser/                 # Python AST & generic code parsers
│   ├── chunker/                # Code chunking algorithms
│   ├── embeddings/             # Dense vector embedding generators
│   ├── vectorstore/            # Pinecone vector DB interface
│   ├── retrieval/              # Vector search & RAG retriever
│   ├── llm/                    # Multi-provider LLM client wrappers
│   ├── graph/                  # Dependency graph builder (NetworkX)
│   └── metadata/               # Code metrics & symbol extraction
│
└── frontend/                   # React Web Application
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── routes/             # TanStack Router page routes
    │   ├── lib/                # API client & state management
    │   └── styles.css          # Tailwind & custom CSS styles
    ├── public/                 # Static assets & favicon
    ├── package.json            # Node dependencies
    └── vite.config.ts          # Vite build configuration
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Backend API Unreachable` | Backend server isn't running | Ensure `python server.py` is executed and running on port 8000. |
| `Pinecone Unauthorized` | Invalid or missing Pinecone key | Check your `PINECONE_API_KEY` in `.env`. |
| `No LLM Provider Available` | Missing LLM API keys | Add at least one key (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`) to `.env`. |
| `Port 8080 already in use` | Another Vite instance is running | Stop other dev servers or let Vite auto-assign the next port (e.g. `8081`). |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Sentence-Transformers, Pinecone SDK, NetworkX, Pydantic
- **Frontend**: React 18, TypeScript, Vite, TanStack Router, TanStack Query, Lucide Icons, Tailwind CSS
- **AI / ML**: RAG (Retrieval-Augmented Generation), AST Parsing, Vector Similarity Search

---

## 📜 License

This project is released under the **MIT License**.
