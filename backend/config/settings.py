"""
Django settings for Kolchi Business.

Production-oriented configuration with environment-based secrets,
PostgreSQL, DRF, JWT authentication, and security-ready defaults.
"""

from datetime import timedelta
from pathlib import Path

import environ


# ============================================================
# Base Configuration
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, True),
)

environ.Env.read_env(BASE_DIR / ".env")


# ============================================================
# Django Core Settings
# ============================================================

SECRET_KEY = env("DJANGO_SECRET_KEY")

DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["127.0.0.1", "localhost"],
)


# ============================================================
# Application Definition
# ============================================================

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",

    # Local apps
    "apps.core",
    "apps.users",
    "apps.catalog",
    "apps.cart",
    "apps.orders",
]


# ============================================================
# Middleware
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / WSGI Configuration
# ============================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# Templates
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ============================================================
# Database
# PostgreSQL is used for development and production.
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST", default="127.0.0.1"),
        "PORT": env("POSTGRES_PORT", default="5432"),
    }
}


# ============================================================
# Custom User Model
# ============================================================

AUTH_USER_MODEL = "users.User"


# ============================================================
# Password Security
# Argon2 is preferred, with PBKDF2 as fallback.
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]


# ============================================================
# Django REST Framework
# JWT authentication is the default API authentication method.
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination.PageNumberPagination"
    ),
    "PAGE_SIZE": 20,
}


# ============================================================
# JWT Configuration
# Short-lived access tokens + rotating refresh tokens.
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,

    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",

    "AUTH_HEADER_TYPES": ("Bearer",),

    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}


# ============================================================
# Internationalization
# ============================================================

LANGUAGE_CODE = env(
    "DJANGO_LANGUAGE_CODE",
    default="fa-ir",
)

TIME_ZONE = env(
    "DJANGO_TIME_ZONE",
    default="Asia/Tehran",
)

USE_I18N = True
USE_TZ = True


# ============================================================
# Static Files
# ============================================================

STATIC_URL = "static/"


# ============================================================
# Default Primary Key
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"