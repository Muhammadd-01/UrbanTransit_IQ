"""
Tests for security, password hashing, and JWT creation/validation.
"""

try:
    import pytest
except ImportError:
    pytest = None
from datetime import timedelta
from backend.app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)


def test_password_hashing():
    raw_pass = "UrbanTransit2026!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_lifecycle():
    data = {"sub": "affan@urbantransit.iq", "role": "admin"}
    token = create_access_token(data=data, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_token(token)
    assert payload["sub"] == "affan@urbantransit.iq"
    assert payload["role"] == "admin"
    assert "exp" in payload
