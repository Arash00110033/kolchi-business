from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterAPIView(generics.CreateAPIView):
    """
    Register a new user account.
    """

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class LoginAPIView(generics.GenericAPIView):
    """
    Authenticate a user and return JWT access/refresh tokens.
    """

    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_data = serializer.create_token_response()

        return Response(token_data)


class MeAPIView(generics.RetrieveAPIView):
    """
    Return the currently authenticated user's profile.
    """

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class RefreshTokenAPIView(TokenRefreshView):
    """
    Issue a new access token using a valid refresh token.
    """

    permission_classes = (permissions.AllowAny,)