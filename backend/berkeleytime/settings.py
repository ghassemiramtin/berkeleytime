"""
Django settings for berkeleytime project.

Generated by 'django-admin startproject' using Django 3.1.1.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/

See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/
"""

import os
import sys
from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse

from berkeleytime.config.general import *
from berkeleytime.config.semesters.fall2023 import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

IS_LOCALHOST = os.getenv('ENVIRONMENT_NAME') == 'localhost'

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# Admins/managers receive 500s and 404s
ADMINS = MANAGERS = (
    ('ASUC OCTO Berkeleytime Team', 'octo.berkeleytime@asuc.org'),
    ('Grace Luo', 'graceluo@berkeley.edu'),
)

# Debug - show tracebacks in browser
DEBUG = IS_LOCALHOST

# Allowed hosts
ALLOWED_HOSTS = ['*'] # Wildcard '*' allow is not a security issue because back-end is closed to private Kubernetes traffic

# Database
pg_instance = urlparse(os.getenv('DATABASE_URL'))
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': pg_instance.hostname,
        'PORT': pg_instance.port,
        'USER': pg_instance.username,
        'PASSWORD': pg_instance.password,
        'NAME': pg_instance.path.strip('/'),
    }
}

# Cache
redis_instance = urlparse(os.getenv('REDIS_URL'))
CACHES = {
    'default': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': '{0}:{1}'.format(redis_instance.hostname, redis_instance.port),
        'OPTIONS': {
            'PASSWORD': redis_instance.password,
            'DB': 0,
        }
    }
}

# Email config
if IS_LOCALHOST:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    EMAIL_HOST = 'localhost'
    EMAIL_PORT = 1025
    EMAIL_HOST_USER = ''
    EMAIL_HOST_PASSWORD = ''
    EMAIL_USE_TLS = False
    DEFAULT_FROM_EMAIL = f'Berkeleytime <{os.getenv("GOOGLE_EMAIL")}>'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_HOST_USER = os.getenv('SENDGRID_USERNAME')
    EMAIL_HOST_PASSWORD = os.getenv('SENDGRID_PASSWORD')
    EMAIL_USE_TLS = True
    DEFAULT_FROM_EMAIL = os.getenv('GOOGLE_EMAIL')

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'berkeleytime',
    'catalog',
    'enrollment',
    'grades',
    'playlist',
    'forms',
    'user',
    'graphene_django',
    'scheduler'
]

# Middlewares
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware",
]

# Root URLconf file
ROOT_URLCONF = 'berkeleytime.urls'

# WSGI app object to use with runserver
WSGI_APPLICATION = 'berkeleytime.wsgi.application'

# CORS configs
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]


# https://stackoverflow.com/questions/14058453/making-python-loggers-output-all-messages-to-stdout-in-addition-to-log-file
import logging
import logging.config
class _ExcludeErrorsFilter(logging.Filter):
    def filter(self, record):
        """Filters out log messages with log level WARNING (numeric value: 30) or higher.""" # https://docs.python.org/3/howto/logging.html
        return record.levelno < 30
LOGGING_CONFIG = None
logging.config.dictConfig({
    'version': 1,
    'filters': {
        'exclude_errors': {
            '()': _ExcludeErrorsFilter
        }
    },
    'handlers': {
        'stderr': {
            'class': 'logging.StreamHandler',
            'level': 'ERROR',
            'stream': sys.stderr
        },
        'stdout': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'filters': ['exclude_errors'],
            'stream': sys.stdout
        }
    },
    'root': {
        'level': 'NOTSET',
        'handlers': ['stderr', 'stdout']
    },
})


# List of template engines (we need this for admin panel)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    }
]

# Course/Class API credentials
SIS_COURSE_APP_ID = os.getenv('SIS_COURSE_APP_ID')
SIS_COURSE_APP_KEY = os.getenv('SIS_COURSE_APP_KEY')
SIS_CLASS_APP_ID = os.getenv('SIS_CLASS_APP_ID')
SIS_CLASS_APP_KEY = os.getenv('SIS_CLASS_APP_KEY')

# Graphene Config
GRAPHENE = {
    'SCHEMA': 'berkeleytime.schema.schema',
    'MIDDLEWARE': [
        'graphql_jwt.middleware.JSONWebTokenMiddleware',
    ],
    'RELAY_CONNECTION_MAX_LIMIT': 100000,
}

# Graphene jwt
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # for admin panel
    'graphql_jwt.backends.JSONWebTokenBackend',
]

GRAPHQL_JWT = {
    'JWT_VERIFY_EXPIRATION': True,
    'JWT_EXPIRATION_DELTA': timedelta(days=1),
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=7),
    'JWT_HIDE_TOKEN_FIELDS': True  # if we want to prevent sending the token back in response
}

# Password validation - we intend to use Google sign-in, but we may add in-house auth in the future
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]

# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = False

STATIC_URL = '/static/'


