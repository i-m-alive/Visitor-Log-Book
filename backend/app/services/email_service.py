# app/services/email_service.py
import smtplib
from email.message import EmailMessage
import logging
from app.core.config import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

logger = logging.getLogger("email_service")

def send_visit_email(to_email: str, visitor_name: str, purpose: str, phone: str):
    """
    Sends a basic notification email to the person to be visited.
    If email fails, it raises an exception to allow caller to handle/log.
    """
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS]):
        logger.warning("Email config missing; skipping sending email.")
        return

    msg = EmailMessage()
    msg["Subject"] = "Visitor Arrival Notification"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    msg.set_content(
        f"""Hello,

A visitor has arrived.

Name: {visitor_name}
Purpose: {purpose}
Phone: {phone}

This is an automated notification.
"""
    )

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

    except Exception as e:
        logger.exception("Failed sending email: %s", e)
        raise
