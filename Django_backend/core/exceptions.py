"""
core/exceptions.py
==================
Global DRF Exception Handler — Standardizes all API error responses.

All API errors are returned in this consistent format:

{
  "success": false,
  "error": {
    "code": "authentication_failed",
    "message": "Authentication credentials were not provided.",
    "details": null
  }
}

This replaces Supabase's Row-Level Security error format with a
clean, predictable JSON structure the frontend can reliably parse.
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Converts DRF exceptions into a standardized JSON error envelope.
    Also logs server-side errors for debugging.
    """
    # Get the standard DRF response first
    response = exception_handler(exc, context)

    if response is not None:
        # Extract the error detail
        detail = response.data

        # Flatten single-key dicts like {"detail": "..."} → just the string
        if isinstance(detail, dict) and "detail" in detail and len(detail) == 1:
            message = str(detail["detail"])
            code = getattr(detail.get("detail"), "code", "error")
        elif isinstance(detail, list):
            message = "; ".join(str(e) for e in detail)
            code = "validation_error"
        else:
            message = str(detail)
            code = "error"

        response.data = {
            "success": False,
            "error": {
                "code":    code,
                "message": message,
                "details": detail if not isinstance(detail, str) else None,
            }
        }

    else:
        # Unhandled server error — log it and return 500
        logger.exception(
            "Unhandled exception in view %s: %s",
            context.get("view", "?"),
            exc,
        )
        response = Response(
            {
                "success": False,
                "error": {
                    "code":    "server_error",
                    "message": "An unexpected internal server error occurred.",
                    "details": None,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
