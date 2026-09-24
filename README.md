# 💌 Our Little Complaint Box ♡
### *A Private Romantic Sanctuary & Love-Letter Diary for Two*

---

> “For the things you want to say,  
> the things you wish I'd notice,  
> and the things you don't know how to ask for. ♡”

---

## 🌹 What is "Our Little Complaint Box"?

**Our Little Complaint Box** is a private, warm, romantic web application made specifically for a couple. It transforms relationship grievances, unspoken wishes, and tender requests from feeling like stressful confrontations into an intimate, playful exchange of vintage love letters.

### 💖 Key Features:

1. **Vintage Romantic Stationery Aesthetic**:
   - Inspired by 1950s/1960s handwritten love letters, warm aged parchment paper, dried rose petals, burgundy wax seals, polaroid frames, and postage stamps.
   - Elegant typography with *Cormorant Garamond*, *Playfair Display*, and intimate handwritten notes in *Caveat* & *Marck Script*.

2. **🌸 Her Side (Girlfriend's Diary)**:
   - Safe, gentle sanctuary to write what's on her mind.
   - Comprehensive letter-writing form:
     - **“What's bothering you?”** (open-hearted venting)
     - **“What do you wish I'd done?”** (wished actions)
     - **“What do you want from me?”** (I want an apology, reassurance, attention, quality time, a hug, someone to listen, etc.)
     - **“Give me a hint instead 👀”** (when she doesn't want to say it directly)
     - **Cute Moods** (🥺 Sad, 😤 Angry, 😒 Annoyed, 💔 Hurt, 🥹 Emotional, 😶 Disappointed, ❤️ Just need you, 😂 I'm not actually that mad)
     - **“How much trouble am I in? 😭”** (🌱 Tiny thing, 🌷 I noticed it, 🥀 It really bothered me, 💔 We need to talk)
     - **Polaroid Photo Attachment** (upload memes, screenshots, or memory photos)
     - **Wax Seal Submission Animation** with soft confetti shower upon safe delivery.
   - Real-time feedback showing:
     - 🌸 New Note
     - 💌 He Read It
     - 🫶 Working On It
     - ✨ Done
     - “Your note has been answered 💌”

3. **💌 My Side (Boyfriend's Mission Board)**:
   - Dedicated dashboard to understand her heart and make her smile.
   - Vintage stats counters: New Notes, Things to Work On, Completed, Total Requests.
   - Random gentle reminders:
     - *“She might not need fixing. She might just need you.”*
     - *“A 5-second forehead kiss changes her whole day.”*
     - *“Listen without offering an immediate logical solution.”*
   - Filter, sort (newest, oldest, most serious first 🥀), and instant keyword search.
   - Full handwritten letter view unfolded on a vintage desk.
   - Response composer: *“What am I going to do about it?”*
   - Status actions with confirmation modal: *“Are you sure you did it? 👀”*

4. **✨ Things We Fixed Together (Postcard Collection)**:
   - Completed notes are preserved forever as old romantic postcards with scalloped edges and postal cancellation stamps.
   - Attach sweet memory notes and couple promises (*“The Sacred Doorway Kiss Rule”*).

5. **🕊️ Our Little Corner (Shared Couple Sanctuary)**:
   - Days together counter calculated from anniversary.
   - Total problems resolved together counter.
   - Virtual warm forehead kiss button (interactive confetti & warmth).
   - Secret Easter eggs:
     - Wax seal click: *“Sealed with love. 💌”*
     - Tiny heart click: *“I knew you'd click that. ♡”*
     - Suspicious mood Easter egg: selecting *“😂 I'm not actually that mad”* triggers a playful *“Hmm. Suspicious. 👀”* warning.

6. **🎶 Vintage Music Box Audio Player**:
   - Optional, non-intrusive lullaby synthesizer (Web Audio API Canon/Clair-de-lune melody).
   - Vintage spinning 45-RPM vinyl turntable with play/pause and volume slider.
   - Zero external audio file dependencies (works 100% offline).

---

## 🗝️ Default Couple Credentials

| Side | Role | Username | Password |
|---|---|---|---|
| **🌸 Her Side** | `GIRLFRIEND` | `girlfriend` | `love123` |
| **💌 My Side** | `BOYFRIEND` | `boyfriend` | `love123` |

*(You can also use the convenient **"1-Click Enter ✨"** buttons on the landing page or the **"Switch Side"** toggle on the navbar to easily preview both perspectives!)*

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Backend**: Python FastAPI, Uvicorn, SQLite3 (zero-configuration database), PBKDF2 SHA-256 password hashing with salt, HMAC-SHA256 JWT sessions.
- **Single-port Full-Stack Serving**: The FastAPI backend automatically serves the built frontend at `http://127.0.0.1:8000/`.

---

## 🚀 How to Run Locally

### Option 1: Run the Backend & Complete App (Recommended)
From the project folder:
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser!

### Option 2: Run with Vite Dev Server (for Frontend Development)
In Terminal 1 (Backend):
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

In Terminal 2 (Frontend with Vite Hot-Reload):
```powershell
cd frontend
npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser. (All `/api` and `/uploads` requests automatically proxy to the FastAPI backend).
