import sqlite3
from datetime import datetime, timedelta
from database import DB_PATH, init_db
from auth import hash_password

def seed_data():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if users already seeded
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Seed Girlfriend
    gf_hash, gf_salt = hash_password("love123")
    cursor.execute("""
    INSERT INTO users (name, username, password_hash, salt, role, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("My Little Sunshine", "girlfriend", gf_hash, gf_salt, "GIRLFRIEND", "🌸"))
    gf_id = cursor.lastrowid

    # Seed Boyfriend
    bf_hash, bf_salt = hash_password("love123")
    cursor.execute("""
    INSERT INTO users (name, username, password_hash, salt, role, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
    """, ("Her Favorite Person", "boyfriend", bf_hash, bf_salt, "BOYFRIEND", "💌"))
    bf_id = cursor.lastrowid

    # Sample Complaint 1: In progress / read
    time_1 = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO complaints (
        user_id, title, description, wished_action, desired_response_type,
        hint, mood, seriousness, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        gf_id,
        "You forgot something…",
        "I don't know, I just felt like you weren't paying attention to me yesterday when I was talking about my stressful morning.",
        "I wanted you to notice that I was having a bad day and pull me in for a warm hug instead of checking your phone.",
        "I want reassurance",
        "It's something you usually do when you know I'm upset… but you seemed distracted.",
        "🥺 Sad",
        "🌷 I noticed it",
        "read",
        time_1,
        time_1
    ))
    c1_id = cursor.lastrowid

    # Boyfriend response to Complaint 1
    resp_time_1 = (datetime.now() - timedelta(days=1, hours=20)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO responses (complaint_id, responder_id, message, created_at)
    VALUES (?, ?, ?, ?)
    """, (
        c1_id,
        bf_id,
        "I'm so sorry, my love. I got wrapped up in work and I hate that it made you feel unheard. You are always my top priority. Tonight, phones are going in the drawer and I am all yours. ♡",
        resp_time_1
    ))

    # Girlfriend reaction to Complaint 1
    cursor.execute("""
    INSERT INTO reactions (complaint_id, user_id, reaction)
    VALUES (?, ?, ?)
    """, (c1_id, gf_id, "🥹 That made me happy"))

    # Sample Complaint 2: Working on it
    time_2 = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO complaints (
        user_id, title, description, wished_action, desired_response_type,
        hint, mood, seriousness, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        gf_id,
        "I want something sweet 👀",
        "I don't want to ask directly because that ruins the romantic surprise, but my sweet tooth and my heart are craving our little tradition.",
        "A spontaneous dessert date or warm pastry surprise this weekend.",
        "I want quality time",
        "Think about that vintage bakery with the warm cinnamon buns we passed by last week…",
        "❤️ Just need you",
        "🌱 Tiny thing",
        "working",
        time_2,
        time_2
    ))
    c2_id = cursor.lastrowid

    resp_time_2 = (datetime.now() - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO responses (complaint_id, responder_id, message, created_at)
    VALUES (?, ?, ?, ?)
    """, (
        c2_id,
        bf_id,
        "Secret mission accepted! Already marked Saturday afternoon for warm cinnamon buns and your favorite hot chocolate. 🥐✨",
        resp_time_2
    ))

    cursor.execute("""
    INSERT INTO reactions (complaint_id, user_id, reaction)
    VALUES (?, ?, ?)
    """, (c2_id, gf_id, "💋 Come here"))

    # Sample Complaint 3: Completed / Fixed together
    time_3 = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")
    comp_time_3 = (datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO complaints (
        user_id, title, description, wished_action, desired_response_type,
        hint, mood, seriousness, status, created_at, updated_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        gf_id,
        "You rushed out without our goodbye kiss",
        "You were rushing for your morning commute and only waved from the doorway. It left me feeling a bit empty all morning.",
        "Even when running late, a 5-second forehead kiss gives me wings for the day.",
        "I want a hug",
        "Our sacred little front-door routine ♡",
        "😒 Annoyed",
        "🥀 It really bothered me",
        "completed",
        time_3,
        comp_time_3,
        comp_time_3
    ))
    c3_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO responses (complaint_id, responder_id, message, created_at)
    VALUES (?, ?, ?, ?)
    """, (
        c3_id,
        bf_id,
        "Never letting that happen again! I put a reminder by the key rack. You get the sweetest forehead kiss every single morning without exception.",
        comp_time_3
    ))

    cursor.execute("""
    INSERT INTO reactions (complaint_id, user_id, reaction)
    VALUES (?, ?, ?)
    """, (c3_id, gf_id, "❤️ Loved this"))

    # Memory attached to Complaint 3
    cursor.execute("""
    INSERT INTO memories (complaint_id, title, description, image_url, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (
        c3_id,
        "The Sacred Doorway Kiss Rule ✨",
        "Officially ratified into our couple constitution. No rushing past without a sweet warm kiss on the forehead.",
        None,
        comp_time_3
    ))

    # Sample Complaint 4: Brand New
    time_4 = (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO complaints (
        user_id, title, description, wished_action, desired_response_type,
        hint, mood, seriousness, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        gf_id,
        "Missing you extra today",
        "We've both been head-down in work and it feels like we haven't just sat and talked with zero screens on.",
        "An evening on the rug with fairy lights, herbal tea, and no phones.",
        "I want quality time",
        "Fairy lights and your softest oversized sweater.",
        "🥺 Sad",
        "🌷 I noticed it",
        "new",
        time_4,
        time_4
    ))
    c4_id = cursor.lastrowid

    # Notification for Boyfriend
    cursor.execute("""
    INSERT INTO notifications (user_id, complaint_id, message, type, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        bf_id,
        c4_id,
        "💌 A new little note has arrived: 'Missing you extra today'",
        "new_note",
        0,
        time_4
    ))

    # Notification for Girlfriend
    cursor.execute("""
    INSERT INTO notifications (user_id, complaint_id, message, type, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        gf_id,
        c2_id,
        "Someone answered your little note: 'I want something sweet 👀'",
        "response_received",
        0,
        resp_time_2
    ))

    conn.commit()
    conn.close()
    print("Database successfully seeded with romantic couple sample data!")

if __name__ == "__main__":
    seed_data()
