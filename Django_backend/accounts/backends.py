"""
accounts/backends.py
====================
Custom Authentication Backend — Login with Phone OR Email.

Django's default backend only supports username/password.
This backend allows:
  - Login with phone + password  (primary)
  - Login with email + password  (secondary fallback)

Usage: Set in settings.py AUTHENTICATION_BACKENDS list.
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class PhoneOrEmailBackend(ModelBackend):
    """
    Authenticate using phone number or email address + password.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        # Try phone first (primary login credential)
        user = None
        try:
            user = User.objects.get(phone=username)
        except User.DoesNotExist:
            pass

        # Fallback to email
        if user is None and "@" in username:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                return None

        if user is None:
            return None

        # Check password and that the account is usable
        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None

    def user_can_authenticate(self, user):
        """
        Reject soft-deleted or banned users at the auth layer.
        """
        is_active = getattr(user, "is_active", True)
        is_deleted = getattr(user, "is_deleted", False)
        return is_active and not is_deleted
