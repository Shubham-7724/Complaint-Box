import os
import hmac
import hashlib
import base64
import json
import secrets
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.getenv("JWT_SECRET", "vintage-complaint-box-secret-key-heart-1950s-romantic-diary")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 30  # 30 days of sweet memories

security = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    computed_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, expected_hash)

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_jwt_token(payload: Dict[str, Any]) -> str:
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    header_b64 = _base64url_encode(header_json)
    
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + TOKEN_EXPIRY_SECONDS
    payload_copy["iat"] = int(time.time())
    payload_json = json.dumps(payload_copy, separators=(',', ':')).encode('utf-8')
    payload_b64 = _base64url_encode(payload_json)
    
    to_sign = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), to_sign, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> Dict[str, Any]:
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Invalid romantic seal (token format)")
    
    header_b64, payload_b64, sig_b64 = parts
    to_sign = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), to_sign, hashlib.sha256).digest()
    
    try:
        actual_sig = _base64url_decode(sig_b64)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed token signature")
        
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise HTTPException(status_code=401, detail="The wax seal has been broken (invalid token)")
        
    try:
        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        raise HTTPException(status_code=401, detail="Could not read the note payload")
        
    if payload.get("exp", 0) < time.time():
        raise HTTPException(status_code=401, detail="Your note session has expired, please log back in ♡")
        
    return payload

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Please enter our little world first (Not authenticated)")
    token = credentials.credentials
    return decode_jwt_token(token)
