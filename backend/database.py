import os
import psycopg2
from psycopg2.extras import DictCursor
from contextlib import contextmanager


DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL environment variable is not set")

    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=DictCursor
    )


def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def db_context():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with db_context() as conn:
        cursor = conn.cursor()

        # Users Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('GIRLFRIEND', 'BOYFRIEND')),
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Complaints Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            wished_action TEXT,
            desired_response_type TEXT,
            hint TEXT,
            mood TEXT NOT NULL,
            seriousness TEXT NOT NULL,
            attachment_url TEXT,
            status TEXT NOT NULL DEFAULT 'new'
                CHECK(status IN ('new', 'read', 'working', 'completed')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        );
        """)

        # Responses Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS responses (
            id SERIAL PRIMARY KEY,
            complaint_id INTEGER NOT NULL
                REFERENCES complaints(id) ON DELETE CASCADE,
            responder_id INTEGER NOT NULL REFERENCES users(id),
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Reactions Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reactions (
            id SERIAL PRIMARY KEY,
            complaint_id INTEGER NOT NULL
                REFERENCES complaints(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id),
            reaction TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(complaint_id, user_id)
        );
        """)

        # Memories Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id SERIAL PRIMARY KEY,
            complaint_id INTEGER
                REFERENCES complaints(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Notifications Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            complaint_id INTEGER
                REFERENCES complaints(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Couple Metadata Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS couple_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """)

        # Default couple information
        cursor.execute("""
        INSERT INTO couple_meta (key, value)
        VALUES
            ('anniversary', '2024-06-14'),
            ('girlfriend_nickname', 'My Little Sunshine ♡'),
            ('boyfriend_nickname', 'My Favorite Person ♡')
        ON CONFLICT (key) DO NOTHING;
        """)
