# Authentication API routes for user registration, login, logout, refresh, and profile.

from django.urls import path

from .views import (
    LoginAPIView,
    LogoutAPIView,
    MeAPIView,
    RefreshTokenAPIView,
    RegisterAPIView,
)


urlpatterns = [
    path(
        "register/",
        RegisterAPIView.as_view(),
        name="auth-register",
    ),
    path(
        "login/",
        LoginAPIView.as_view(),
        name="auth-login",
    ),
    path(
        "logout/",
        LogoutAPIView.as_view(),
        name="auth-logout",
    ),
    path(
        "refresh/",
        RefreshTokenAPIView.as_view(),
        name="auth-refresh",
    ),
    path(
        "me/",
        MeAPIView.as_view(),
        name="auth-me",
    ),
]
