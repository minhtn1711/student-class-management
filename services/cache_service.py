import time

from .env_service import setting


_CACHE = {}


def _ttl():
    try:
        return max(int(setting("CACHE_TTL_SECONDS", "60")), 0)
    except ValueError:
        return 60


def get(key):
    item = _CACHE.get(key)
    if not item:
        return None

    expires_at, value = item
    if expires_at < time.time():
        _CACHE.pop(key, None)
        return None
    return value


def set(key, value):
    ttl = _ttl()
    if ttl <= 0:
        return value
    _CACHE[key] = (time.time() + ttl, value)
    return value


def remember(key, loader):
    cached = get(key)
    if cached is not None:
        return cached
    return set(key, loader())


def clear(prefix=None):
    if not prefix:
        _CACHE.clear()
        return

    for key in list(_CACHE):
        if key.startswith(prefix):
            _CACHE.pop(key, None)
