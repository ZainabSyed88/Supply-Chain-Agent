from pathlib import Path
import os
import sys

import bcrypt


ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
os.chdir(BACKEND_DIR)

for path in (ROOT_DIR, BACKEND_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)


from app.services.auth_service import hash_password, verify_password


def test_hash_password_supports_long_passwords():
    password = "long-password-" * 10

    hashed_password = hash_password(password)

    assert hashed_password.startswith("bcrypt_sha256$v=1$$2")
    assert verify_password(password, hashed_password) is True


def test_verify_password_accepts_legacy_bcrypt_hashes():
    password = "admin123"
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    assert verify_password(password, hashed_password) is True


def test_verify_password_rejects_long_password_against_legacy_bcrypt_without_crashing():
    hashed_password = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")

    assert verify_password("very-long-password-" * 10, hashed_password) is False
