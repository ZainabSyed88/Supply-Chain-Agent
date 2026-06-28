from __future__ import annotations

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("email")


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials are not configured; skipping email", to_email=to_email, subject=subject)
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"ChainPulse <{settings.smtp_user}>"
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            start_tls=True,
            username=settings.smtp_user,
            password=settings.smtp_password,
        )
        return True
    except Exception as exc:
        logger.error("Failed to send email", to_email=to_email, subject=subject, error=str(exc))
        return False


def welcome_email_template(user_name: str, username: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px;">
          <h1 style="margin:0 0 16px; color:#0f172a;">Welcome to ChainPulse</h1>
          <p style="color:#475569; line-height:1.6;">Hi {user_name}, your account is ready.</p>
          <p style="color:#475569; line-height:1.6;">Username: <strong>{username}</strong></p>
          <p style="color:#475569; line-height:1.6;">Open the dashboard to start monitoring suppliers, shipments, and disruptions.</p>
          <a href="{settings.frontend_url}/auth" style="display:inline-block; margin-top:16px; background:#1d4ed8; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none;">Open ChainPulse</a>
        </div>
      </body>
    </html>
    """


def pipeline_complete_email_template(
    *,
    user_name: str,
    run_id: str,
    duration_seconds: float,
    report_url: str,
) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px;">
          <h1 style="margin:0 0 16px; color:#0f172a;">Pipeline analysis complete</h1>
          <p style="color:#475569; line-height:1.6;">Hi {user_name}, run <strong>{run_id}</strong> completed in {duration_seconds:.1f} seconds.</p>
          <a href="{report_url}" style="display:inline-block; margin-top:16px; background:#059669; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none;">Open reports</a>
        </div>
      </body>
    </html>
    """


def alert_email_template(*, user_name: str, alert_title: str, alert_message: str, severity: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px;">
          <p style="margin:0 0 8px; color:#94a3b8; text-transform:uppercase; font-size:12px;">{severity} alert</p>
          <h1 style="margin:0 0 16px; color:#0f172a;">{alert_title}</h1>
          <p style="color:#475569; line-height:1.6;">Hi {user_name},</p>
          <p style="color:#475569; line-height:1.6;">{alert_message}</p>
          <a href="{settings.frontend_url}/dashboard" style="display:inline-block; margin-top:16px; background:#1d4ed8; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none;">Open dashboard</a>
        </div>
      </body>
    </html>
    """
