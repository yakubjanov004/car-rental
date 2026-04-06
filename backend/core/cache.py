import hashlib
from functools import wraps

from django.core.cache import cache


def cache_response(timeout=300, key_prefix='rl'):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            raw = f"{key_prefix}:{request.path}:{request.GET.urlencode()}"
            key = hashlib.md5(raw.encode('utf-8')).hexdigest()
            cached = cache.get(key)
            if cached is not None:
                return cached

            response = func(self, request, *args, **kwargs)
            cache.set(key, response, timeout)
            return response

        return wrapper

    return decorator
