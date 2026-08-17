from django.urls import path

from .views import (
    LoginAPIView,
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