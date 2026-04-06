from decouple import config

ENV = config('DJANGO_ENV', default='development').strip().lower()

if ENV == 'production':
    from .production import *  # noqa: F401,F403
else:
    from .development import *  # noqa: F401,F403
