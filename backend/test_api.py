import urllib.request
import json

def post(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

def patch(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='PATCH')
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

def main():
    print("Testing Our Little Complaint Box API...")
    
    # 1. Login Girlfriend
    gf_res = post('http://127.0.0.1:8000/api/auth/login', {'username': 'girlfriend', 'password': 'love123'})
    gf_token = gf_res['token']
    print("1. Girlfriend Login: SUCCESS (Role: {})".format(gf_res['user']['role']))

    # 2. Login Boyfriend
    bf_res = post('http://127.0.0.1:8000/api/auth/login', {'username': 'boyfriend', 'password': 'love123'})
    bf_token = bf_res['token']
    print("2. Boyfriend Login: SUCCESS (Role: {})".format(bf_res['user']['role']))

    # 3. Girlfriend creates a new complaint
    c_res = post('http://127.0.0.1:8000/api/complaints', {
        'title': 'Test Romantic Note',
        'description': 'Testing our little complaint box end-to-end!',
        'wished_action': 'A big warm hug and a cup of warm tea',
        'desired_response_type': 'I want a hug',
        'hint': 'Check the kitchen kettle...',
        'mood': '❤️ Just need you',
        'seriousness': '🌱 Tiny thing'
    }, token=gf_token)
    cid = c_res['id']
    print("3. Complaint Created: SUCCESS (ID: {})".format(cid))

    # 4. Boyfriend reads complaint and replies
    reply_res = post(f'http://127.0.0.1:8000/api/complaints/{cid}/responses', {
        'message': 'Big warm hug on the way right now, my love! ❤️'
    }, token=bf_token)
    print("4. Boyfriend Response: SUCCESS (Message: {})".format(reply_res['message']))

    # 5. Girlfriend reacts
    rx_res = post(f'http://127.0.0.1:8000/api/complaints/{cid}/reactions', {
        'reaction': '❤️ Loved this'
    }, token=gf_token)
    print("5. Girlfriend Reaction: SUCCESS (Reaction: {})".format(rx_res['reaction']))

    # 6. Boyfriend marks completed
    st_res = patch(f'http://127.0.0.1:8000/api/complaints/{cid}/status', {
        'status': 'completed'
    }, token=bf_token)
    print("6. Mark Completed: SUCCESS (Status: {})".format(st_res['status']))

    # 7. Add memory postcard
    mem_res = post(f'http://127.0.0.1:8000/api/complaints/{cid}/memories', {
        'title': 'The Great Kitchen Kettle Hug Pact',
        'description': 'Whenever the kettle whistles, a hug must be exchanged.'
    }, token=bf_token)
    print("7. Postcard Memory: SUCCESS (Message: {})".format(mem_res['message']))

    # 8. Check Notifications
    notifs = get('http://127.0.0.1:8000/api/notifications', token=gf_token)
    print("8. Notifications: SUCCESS (Count: {})".format(len(notifs['items'])))

    print("\nALL API FLOWS PASSED WITH FLYING COLORS! ♡")

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    main()
