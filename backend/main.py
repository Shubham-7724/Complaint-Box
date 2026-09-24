```python
import os
import shutil
import uuid
import random
from datetime import datetime, date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import init_db, get_db
from auth import (
    verify_password,
    create_jwt_token,
    get_current_user
)
from seed import seed_data


# ----------------- FILE UPLOADS -----------------

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ----------------- APP -----------------

app = FastAPI(
    title="Our Little Complaint Box API",
    version="1.0.0"
)


# ----------------- CORS -----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------- STATIC UPLOADS -----------------

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# ----------------- DATABASE STARTUP -----------------

@app.on_event("startup")
def on_startup():
    init_db()
    seed_data()


# ----------------- PYDANTIC SCHEMAS -----------------

class LoginRequest(BaseModel):
    username: str
    password: str
    preferred_role: Optional[str] = None


class QuickLoginRequest(BaseModel):
    role: str


class ComplaintCreate(BaseModel):
    title: str
    description: str
    wished_action: Optional[str] = None
    desired_response_type: Optional[str] = None
    hint: Optional[str] = None
    mood: str
    seriousness: str
    attachment_url: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class ResponseCreate(BaseModel):
    message: str


class ReactionCreate(BaseModel):
    reaction: str


class MemoryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None


# ----------------- ROMANTIC CONTENT -----------------

ROMANTIC_REMINDERS = [
    "She might not need fixing. She might just need you.",
    "Ask her how her day actually went.",
    "Do something nice without being asked.",
    "Remember the little things.",
    "A 5-second hug resets her entire nervous system.",
    "Bring her favorite sweet treat on the way home today.",
    "Listen without trying to offer an immediate logical solution.",
    "Leave a tiny handwritten note in her bag or coat pocket."
]

SWEET_MESSAGES = [
    "You two make this world a softer, warmer place. ♡",
    "Every little thing you fix together builds a forever love.",
    "Listening with love is the greatest superpower in a relationship.",
    "Love isn't having zero disagreements; it's caring enough to always understand each other.",
    "Behind every tiny pout is someone who loves you deeply and wants you close."
]


# ============================================================
# AUTH ENDPOINTS
# ============================================================

@app.post("/api/auth/login")
def login(
    req: LoginRequest,
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE LOWER(username) = LOWER(%s)
        """,
        (req.username.strip(),)
    )

    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="We couldn't find a key for this door. Check your username or password ♡"
        )

    if not verify_password(
        req.password,
        user["salt"],
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password, my love. Try again ♡"
        )

    token = create_jwt_token({
        "sub": str(user["id"]),
        "username": user["username"],
        "name": user["name"],
        "role": user["role"],
        "avatar": user["avatar"]
    })

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }


@app.post("/api/auth/quick-login")
def quick_login(
    req: QuickLoginRequest,
    db=Depends(get_db)
):
    role = req.role.upper()

    if role not in ("GIRLFRIEND", "BOYFRIEND"):
        raise HTTPException(
            status_code=400,
            detail="Invalid couple side"
        )

    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE role = %s
        LIMIT 1
        """,
        (role,)
    )

    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User role profile not found"
        )

    token = create_jwt_token({
        "sub": str(user["id"]),
        "username": user["username"],
        "name": user["name"],
        "role": user["role"],
        "avatar": user["avatar"]
    })

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "username": user["username"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }


@app.get("/api/auth/me")
def get_me(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT id, name, username, role, avatar, created_at
        FROM users
        WHERE id = %s
        """,
        (int(current_user["sub"]),)
    )

    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return dict(user)


# ============================================================
# COMPLAINTS
# ============================================================

@app.get("/api/complaints")
def list_complaints(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    query = """
    SELECT c.*,
           u.name AS author_name,

           (
               SELECT COUNT(*)
               FROM responses r
               WHERE r.complaint_id = c.id
           ) AS response_count,

           (
               SELECT message
               FROM responses r
               WHERE r.complaint_id = c.id
               ORDER BY r.created_at DESC
               LIMIT 1
           ) AS latest_response,

           (
               SELECT reaction
               FROM reactions rx
               WHERE rx.complaint_id = c.id
               ORDER BY rx.created_at DESC
               LIMIT 1
           ) AS latest_reaction,

           (
               SELECT id
               FROM memories m
               WHERE m.complaint_id = c.id
               LIMIT 1
           ) AS memory_id

    FROM complaints c
    JOIN users u ON c.user_id = u.id
    WHERE 1=1
    """

    params = []

    if current_user["role"] == "GIRLFRIEND":
        query += " AND c.user_id = %s"
        params.append(int(current_user["sub"]))

    if status and status != "all":

        if status == "in_progress":
            query += " AND c.status IN ('read', 'working')"

        elif status == "waiting_for_me":
            query += """
            AND c.status != 'completed'
            AND (
                SELECT COUNT(*)
                FROM responses r
                WHERE r.complaint_id = c.id
            ) = 0
            """

        else:
            query += " AND c.status = %s"
            params.append(status)

    if search:
        s = f"%{search.strip()}%"

        query += """
        AND (
            c.title ILIKE %s
            OR c.description ILIKE %s
            OR c.hint ILIKE %s
            OR c.wished_action ILIKE %s
        )
        """

        params.extend([s, s, s, s])

    if sort == "oldest":

        query += " ORDER BY c.created_at ASC"

    elif sort == "most_serious":

        query += """
        ORDER BY
            CASE
                WHEN c.seriousness ILIKE '%We need to talk%' THEN 1
                WHEN c.seriousness ILIKE '%really bothered%' THEN 2
                WHEN c.seriousness ILIKE '%noticed%' THEN 3
                ELSE 4
            END ASC,
            c.created_at DESC
        """

    elif sort == "not_completed":

        query += """
        ORDER BY
            CASE
                WHEN c.status = 'completed' THEN 1
                ELSE 0
            END ASC,
            c.created_at DESC
        """

    else:

        query += " ORDER BY c.created_at DESC"

    cursor.execute(query, params)

    rows = cursor.fetchall()

    return [dict(r) for r in rows]


@app.get("/api/complaints/{complaint_id}")
def get_complaint(
    complaint_id: int,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT c.*, 
               u.name AS author_name,
               u.role AS author_role
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Little note not found ♡"
        )

    cursor.execute(
        """
        SELECT r.*,
               u.name AS responder_name,
               u.role AS responder_role
        FROM responses r
        JOIN users u ON r.responder_id = u.id
        WHERE r.complaint_id = %s
        ORDER BY r.created_at ASC
        """,
        (complaint_id,)
    )

    responses = [
        dict(r)
        for r in cursor.fetchall()
    ]

    cursor.execute(
        """
        SELECT rx.*,
               u.name AS user_name
        FROM reactions rx
        JOIN users u ON rx.user_id = u.id
        WHERE rx.complaint_id = %s
        ORDER BY rx.created_at DESC
        """,
        (complaint_id,)
    )

    reactions = [
        dict(rx)
        for rx in cursor.fetchall()
    ]

    cursor.execute(
        """
        SELECT *
        FROM memories
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    memory_row = cursor.fetchone()

    memory = (
        dict(memory_row)
        if memory_row
        else None
    )

    if (
        current_user["role"] == "BOYFRIEND"
        and complaint["status"] == "new"
    ):
        cursor.execute(
            """
            UPDATE complaints
            SET status = 'read',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (complaint_id,)
        )

        cursor.execute(
            """
            INSERT INTO notifications
                (user_id, complaint_id, message, type, read)
            VALUES
                (%s, %s, %s, 'read', 0)
            """,
            (
                complaint["user_id"],
                complaint_id,
                f"He opened and read your little note: '{complaint['title']}' 💌"
            )
        )

        db.commit()

        complaint = dict(complaint)
        complaint["status"] = "read"

    result = dict(complaint)

    result["responses"] = responses
    result["reactions"] = reactions
    result["memory"] = memory

    return result


@app.post("/api/complaints")
def create_complaint(
    req: ComplaintCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    user_id = int(current_user["sub"])

    now = datetime.now()

    cursor.execute(
        """
        INSERT INTO complaints (
            user_id,
            title,
            description,
            wished_action,
            desired_response_type,
            hint,
            mood,
            seriousness,
            attachment_url,
            status,
            created_at,
            updated_at
        )
        VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            'new', %s, %s
        )
        RETURNING id
        """,
        (
            user_id,
            req.title.strip(),
            req.description.strip(),
            req.wished_action.strip()
            if req.wished_action
            else None,
            req.desired_response_type,
            req.hint.strip()
            if req.hint
            else None,
            req.mood,
            req.seriousness,
            req.attachment_url,
            now,
            now
        )
    )

    complaint_id = cursor.fetchone()["id"]

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE role = 'BOYFRIEND'
        LIMIT 1
        """
    )

    bf_user = cursor.fetchone()

    if bf_user:
        cursor.execute(
            """
            INSERT INTO notifications (
                user_id,
                complaint_id,
                message,
                type,
                read
            )
            VALUES (%s, %s, %s, 'new_note', 0)
            """,
            (
                bf_user["id"],
                complaint_id,
                f"💌 A new little note has arrived: '{req.title.strip()}'"
            )
        )

    db.commit()

    return {
        "id": complaint_id,
        "message": "Your little note has been safely delivered. 💌 I'll come read it."
    }


@app.patch("/api/complaints/{complaint_id}/status")
def update_status(
    complaint_id: int,
    req: StatusUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    if req.status not in (
        "read",
        "working",
        "completed",
        "new"
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM complaints
        WHERE id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    completed_at = (
        datetime.now()
        if req.status == "completed"
        else None
    )

    cursor.execute(
        """
        UPDATE complaints
        SET status = %s,
            updated_at = CURRENT_TIMESTAMP,
            completed_at = COALESCE(%s, completed_at)
        WHERE id = %s
        """,
        (
            req.status,
            completed_at,
            complaint_id
        )
    )

    status_messages = {
        "read":
            f"💌 He read your note: '{complaint['title']}'",

        "working":
            f"🫶 He's working on your note: '{complaint['title']}'",

        "completed":
            f"✨ Someone just checked something off: '{complaint['title']}'!"
    }

    if req.status in status_messages:

        cursor.execute(
            """
            INSERT INTO notifications (
                user_id,
                complaint_id,
                message,
                type,
                read
            )
            VALUES (%s, %s, %s, %s, 0)
            """,
            (
                complaint["user_id"],
                complaint_id,
                status_messages[req.status],
                req.status
            )
        )

    db.commit()

    return {
        "id": complaint_id,
        "status": req.status
    }


# ============================================================
# RESPONSES & REACTIONS
# ============================================================

@app.post("/api/complaints/{complaint_id}/responses")
def create_response(
    complaint_id: int,
    req: ResponseCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM complaints
        WHERE id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    user_id = int(current_user["sub"])

    cursor.execute(
        """
        INSERT INTO responses (
            complaint_id,
            responder_id,
            message
        )
        VALUES (%s, %s, %s)
        RETURNING id
        """,
        (
            complaint_id,
            user_id,
            req.message.strip()
        )
    )

    response_id = cursor.fetchone()["id"]

    if complaint["status"] == "new":

        cursor.execute(
            """
            UPDATE complaints
            SET status = 'working',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (complaint_id,)
        )

    if complaint["user_id"] != user_id:

        cursor.execute(
            """
            INSERT INTO notifications (
                user_id,
                complaint_id,
                message,
                type,
                read
            )
            VALUES (%s, %s, %s, 'response_received', 0)
            """,
            (
                complaint["user_id"],
                complaint_id,
                f"Someone answered your little note: '{complaint['title']}' 👀"
            )
        )

    db.commit()

    return {
        "id": response_id,
        "complaint_id": complaint_id,
        "message": "Response delivered with love ♡"
    }


@app.post("/api/complaints/{complaint_id}/reactions")
def set_reaction(
    complaint_id: int,
    req: ReactionCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM complaints
        WHERE id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    user_id = int(current_user["sub"])

    cursor.execute(
        """
        INSERT INTO reactions (
            complaint_id,
            user_id,
            reaction
        )
        VALUES (%s, %s, %s)
        ON CONFLICT (complaint_id, user_id)
        DO UPDATE SET
            reaction = EXCLUDED.reaction,
            created_at = CURRENT_TIMESTAMP
        """,
        (
            complaint_id,
            user_id,
            req.reaction
        )
    )

    if current_user["role"] == "GIRLFRIEND":

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE role = 'BOYFRIEND'
            LIMIT 1
            """
        )

        bf_user = cursor.fetchone()

        if bf_user:

            cursor.execute(
                """
                INSERT INTO notifications (
                    user_id,
                    complaint_id,
                    message,
                    type,
                    read
                )
                VALUES (%s, %s, %s, 'reaction', 0)
                """,
                (
                    bf_user["id"],
                    complaint_id,
                    f"She reacted to your response on '{complaint['title']}': {req.reaction}"
                )
            )

    db.commit()

    return {
        "complaint_id": complaint_id,
        "reaction": req.reaction
    }


# ============================================================
# MEMORIES
# ============================================================

@app.get("/api/memories")
def get_memories(
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT m.*,
               c.title AS complaint_title,
               c.description AS complaint_desc,
               c.mood AS complaint_mood,
               c.completed_at,

               (
                   SELECT message
                   FROM responses r
                   WHERE r.complaint_id = c.id
                   ORDER BY r.created_at DESC
                   LIMIT 1
               ) AS final_response,

               (
                   SELECT reaction
                   FROM reactions rx
                   WHERE rx.complaint_id = c.id
                   ORDER BY rx.created_at DESC
                   LIMIT 1
               ) AS reaction

        FROM memories m

        LEFT JOIN complaints c
            ON m.complaint_id = c.id

        ORDER BY m.created_at DESC
        """
    )

    rows = cursor.fetchall()

    return [dict(r) for r in rows]


@app.post("/api/complaints/{complaint_id}/memories")
def add_memory(
    complaint_id: int,
    req: MemoryCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM complaints
        WHERE id = %s
        """,
        (complaint_id,)
    )

    complaint = cursor.fetchone()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    cursor.execute(
        """
        SELECT id
        FROM memories
        WHERE complaint_id = %s
        """,
        (complaint_id,)
    )

    existing = cursor.fetchone()

    if existing:

        cursor.execute(
            """
            UPDATE memories
            SET title = %s,
                description = %s,
                image_url = COALESCE(%s, image_url)
            WHERE id = %s
            """,
            (
                req.title,
                req.description,
                req.image_url,
                existing["id"]
            )
        )

        mem_id = existing["id"]

    else:

        cursor.execute(
            """
            INSERT INTO memories (
                complaint_id,
                title,
                description,
                image_url
            )
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (
                complaint_id,
                req.title,
                req.description,
                req.image_url
            )
        )

        mem_id = cursor.fetchone()["id"]

    db.commit()

    return {
        "id": mem_id,
        "message": "Memory pinned to our couple wall ✨"
    }


# ============================================================
# OUR LITTLE CORNER & STATS
# ============================================================

@app.get("/api/corner/stats")
def get_stats(
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        "SELECT COUNT(*) FROM complaints"
    )

    total_requests = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM complaints
        WHERE status = 'new'
        """
    )

    new_notes = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM complaints
        WHERE status IN ('read', 'working')
        """
    )

    in_progress = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM complaints
        WHERE status = 'completed'
        """
    )

    completed = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM memories"
    )

    total_memories = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT value
        FROM couple_meta
        WHERE key = 'anniversary'
        """
    )

    row = cursor.fetchone()

    days_together = 365

    if row and row["value"]:

        try:
            anni_date = datetime.strptime(
                str(row["value"]),
                "%Y-%m-%d"
            ).date()

            days_together = max(
                (date.today() - anni_date).days,
                1
            )

        except Exception:
            pass

    random_quote = random.choice(SWEET_MESSAGES)
    random_reminder = random.choice(ROMANTIC_REMINDERS)

    return {
        "total_requests": total_requests,
        "new_notes": new_notes,
        "in_progress": in_progress,
        "completed": completed,
        "total_memories": total_memories,
        "days_together": days_together,
        "random_message": random_quote,
        "random_reminder": random_reminder
    }


# ============================================================
# NOTIFICATIONS
# ============================================================

@app.get("/api/notifications")
def get_notifications(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = int(current_user["sub"])

    cursor = db.cursor()

    cursor.execute(
        """
        SELECT *
        FROM notifications
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 20
        """,
        (user_id,)
    )

    rows = cursor.fetchall()

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = %s
          AND read = 0
        """,
        (user_id,)
    )

    unread_count = cursor.fetchone()[0]

    return {
        "unread_count": unread_count,
        "items": [dict(r) for r in rows]
    }


@app.post("/api/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE notifications
        SET read = 1
        WHERE id = %s
          AND user_id = %s
        """,
        (
            notif_id,
            int(current_user["sub"])
        )
    )

    db.commit()

    return {
        "success": True
    }


@app.post("/api/notifications/read-all")
def mark_all_read(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE notifications
        SET read = 1
        WHERE user_id = %s
        """,
        (int(current_user["sub"]),)
    )

    db.commit()

    return {
        "success": True
    }


# ============================================================
# FILE UPLOADS
# ============================================================

@app.post("/api/upload")
async def upload_attachment(
    file: UploadFile = File(...)
):
    ext = Path(file.filename).suffix.lower()

    if ext not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Only romantic photo attachments (jpg, png, webp, gif) are supported ♡"
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"

    dest_path = UPLOAD_DIR / unique_filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": file.filename
    }


# ============================================================
# EASTER EGGS
# ============================================================

@app.get("/api/easter-eggs/quote")
def get_random_quote():
    return {
        "quote": random.choice(SWEET_MESSAGES),
        "reminder": random.choice(ROMANTIC_REMINDERS)
    }


# ============================================================
# SERVE FRONTEND IF DIST EXISTS
# ============================================================

FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():

    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.exists():

        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="frontend_assets"
        )

    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):

        if (
            full_path.startswith("api")
            or full_path.startswith("uploads")
        ):
            raise HTTPException(
                status_code=404,
                detail="Not found"
            )

        target = FRONTEND_DIST / full_path

        if target.is_file():
            return FileResponse(str(target))

        return FileResponse(
            str(FRONTEND_DIST / "index.html")
        )


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
```
