from apps.users.models import Notification

def send_notification(user, n_type, title, message, metadata=None, admin_only=False):
    """
    Centralized utility to create notifications.
    Can be easily extended to send Email, SMS or push notifications later.
    """
    if metadata is None:
        metadata = {}
        
    return Notification.objects.create(
        user=user,
        type=n_type,
        title=title,
        message=message,
        metadata=metadata,
        admin_only=admin_only
    )

def notify_admins(n_type, title, message, metadata=None):
    """Helper to send notification to all admins."""
    return send_notification(
        user=None,
        n_type=n_type,
        title=title,
        message=message,
        metadata=metadata,
        admin_only=True
    )
