from .base import *  # noqa: F401,F403

DEBUG = True

# Keep sqlite by default for local development.
DATABASES['default']['ENGINE'] = 'django.db.backends.sqlite3'
