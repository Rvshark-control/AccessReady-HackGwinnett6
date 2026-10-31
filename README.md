# ♿ AccessReady — Backend API & Matching Engine

> **Backend server, data pipeline, and facility matching engine for AccessReady.**

This branch (`codex-backend`) contains the server-side architecture, database models, accommodation matching algorithms, and facility verification APIs for **AccessReady**.

---

## ⚙️ Key Backend Services

* 🔄 **Accommodation Matching Engine:** Core algorithmic logic comparing patient requirement profiles against facility equipment, physical infrastructure, and sensory access datasets.
* 🏥 **Facility & Resource APIs:** RESTful endpoints delivering structured data on clinic features (e.g., wheelchair ramps, height-adjustable examination tables, sensory-friendly rooms, accessible restrooms).
* ⚠️ **Barrier Analysis & Risk Scoring:** Automated pipeline calculating match confidence percentages and flagging missing or unverified facility accommodations.
* 📑 **Checklist Payload Generator:** Service aggregating patient needs and clinic capabilities into structured JSON payloads for frontend checklist rendering and export.
* 🔒 **Data Validation & Privacy:** Secure request handling ensuring patient accessibility parameters are processed efficiently and safely.

---

## 🛠️ Backend Tech Stack

* **Runtime:** Node.js / Express *(or Python FastAPI)*
* **Database:** PostgreSQL / Supabase / MongoDB
* **API Architecture:** RESTful APIs / JSON Data Schemas
* **Testing & Tools:** Postman / Jest

---

## 🚀 Local Backend Setup

1. **Ensure you are on the backend branch:**
   ```bash
   git checkout codex-backend
