"""
JobKaro – Production-Grade Django Settings
==========================================
Author : JobKaro Backend Team
Version: 1.0.0

Settings are split into logical sections:
  1. Core / Security
  2. Application Registry
  3. Middleware
  4. Templates
  5. Database
  6. Authentication & Password Hashing
  7. REST Framework & JWT
  8. CORS
  9. Internationalization
 10. Static & Media Files
 11. Logging
"""

import os
from datetime import timedelta
from pathlib import Path

import environ

# ─── Base Directory ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Read .env ─────────────────────────────────────────────────────────────────
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(BASE_DIR / ".env")


# ══════════════════════════════════════════════════════════════════════════════
# 1. CORE / SECURITY
# ══════════════════════════════════════════════════════════════════════════════
SECRET_KEY = env("SECRET_KEY")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# Link Django auth to our custom user model (MUST be set before first migration)
AUTH_USER_MODEL = "accounts.User"


# ══════════════════════════════════════════════════════════════════════════════
# 2. APPLICATION REGISTRY
# ══════════════════════════════════════════════════════════════════════════════
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
]

LOCAL_APPS = [
    "accounts",      # Custom user model, roles, profiles, admins
    "marketplace",   # Categories, jobs, assignments, addresses
    "finance",       # Wallets, transactions, commissions, disputes
    "moderation",    # Reports, banned entities, audit logs
    "core",          # System settings, notifications, daily stats
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


# ══════════════════════════════════════════════════════════════════════════════
# 3. MIDDLEWARE
# ══════════════════════════════════════════════════════════════════════════════
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",           # CORS — must be high
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "jobkaro.urls"
WSGI_APPLICATION = "jobkaro.wsgi.application"


# ══════════════════════════════════════════════════════════════════════════════
# 4. TEMPLATES
# ══════════════════════════════════════════════════════════════════════════════
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# 5. DATABASE  (PostgreSQL)
# ══════════════════════════════════════════════════════════════════════════════
_DB_ENGINE = env("DB_ENGINE", default="django.db.backends.postgresql")
_IS_SQLITE  = "sqlite3" in _DB_ENGINE

DATABASES = {
    "default": {
        "ENGINE":   _DB_ENGINE,
        "NAME":     env("DB_NAME", default="jobkaro")
                    if not _IS_SQLITE
                    else BASE_DIR / env("DB_NAME", default="db.sqlite3"),
        **({} if _IS_SQLITE else {
            "USER":     env("DB_USER",     default="postgres"),
            "PASSWORD": env("DB_PASSWORD", default=""),
            "HOST":     env("DB_HOST",     default="localhost"),
            "PORT":     env("DB_PORT",     default="5432"),
            "OPTIONS":  {"connect_timeout": 10},
            "CONN_MAX_AGE": 60,
        }),
        # Each HTTP request wraps in a single DB transaction — safer writes
        "ATOMIC_REQUESTS": True,
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ══════════════════════════════════════════════════════════════════════════════
# 6. AUTHENTICATION & PASSWORD HASHING
# ══════════════════════════════════════════════════════════════════════════════
AUTHENTICATION_BACKENDS = [
    "accounts.backends.PhoneOrEmailBackend",   # Custom backend (phone + email)
    "django.contrib.auth.backends.ModelBackend",
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Django uses PBKDF2 + SHA256 by default, which is production-safe.
# Argon2 is listed first as a stronger alternative (optional upgrade path).
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]


# ══════════════════════════════════════════════════════════════════════════════
# 7. REST FRAMEWORK & JWT
# ══════════════════════════════════════════════════════════════════════════════
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
    },
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(
        minutes=env.int("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=60)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=env.int("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7)
    ),
    "ROTATE_REFRESH_TOKENS":  True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "TOKEN_TYPE_CLAIM": "token_type",
}


# ══════════════════════════════════════════════════════════════════════════════
# 8. CORS
# ══════════════════════════════════════════════════════════════════════════════
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "http://localhost:3000"],
)
CORS_ALLOW_CREDENTIALS = True


# ══════════════════════════════════════════════════════════════════════════════
# 9. INTERNATIONALIZATION
# ══════════════════════════════════════════════════════════════════════════════
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True   # All datetimes stored as UTC in DB; served in IST via TIME_ZONE


# ══════════════════════════════════════════════════════════════════════════════
# 10. STATIC & MEDIA FILES
# ══════════════════════════════════════════════════════════════════════════════
STATIC_URL = env("STATIC_URL", default="/static/")
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = env("MEDIA_URL", default="/media/")
MEDIA_ROOT = BASE_DIR / env("MEDIA_ROOT", default="media")


# ══════════════════════════════════════════════════════════════════════════════
# 11. LOGGING (Structured – writes to file in production)
# ══════════════════════════════════════════════════════════════════════════════
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "jobkaro.log",
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}
