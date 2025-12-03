import reflex as rx
from typing import Optional
from sqlmodel import select, desc
from app.models import Notification, User
from app.states.auth_state import AuthState


class NotificationModel(rx.Base):
    """Notification UI model."""
    id: int
    sender_name: str
    content: str
    created_at: str
    read: bool
    type: str


class NotificationState(rx.State):
    """State management for notifications."""

    notifications: list[NotificationModel] = []
    unread_count: int = 0
    show_panel: bool = False

    @rx.event
    async def load_notifications(self):
        """Load notifications for the current user."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return

        with rx.session() as session:
            # Fetch notifications
            nots = session.exec(
                select(Notification, User)
                .join(User, Notification.sender_id == User.id)
                .where(Notification.recipient_id == auth_state.user_id)
                .order_by(desc(Notification.created_at))
                .limit(20)
            ).all()
            
            self.notifications = [
                NotificationModel(
                    id=n.id,
                    sender_name=u.name,
                    content=n.content,
                    created_at=n.created_at.strftime("%b %d, %H:%M"),
                    read=n.read,
                    type=n.type
                )
                for n, u in nots
            ]
            
            # Count unread
            self.unread_count = len([n for n in self.notifications if not n.read])

    @rx.event
    async def mark_as_read(self, notification_id: int):
        """Mark a notification as read."""
        with rx.session() as session:
            notif = session.get(Notification, notification_id)
            if notif:
                notif.read = True
                session.add(notif)
                session.commit()
        
        await self.load_notifications()

    @rx.event
    async def mark_all_read(self):
        """Mark all notifications as read."""
        auth_state = await self.get_state(AuthState)
        if not auth_state.is_authenticated:
            return
            
        with rx.session() as session:
            nots = session.exec(
                select(Notification).where(
                    Notification.recipient_id == auth_state.user_id,
                    Notification.read == False
                )
            ).all()
            for n in nots:
                n.read = True
                session.add(n)
            session.commit()
            
        await self.load_notifications()

    @rx.event
    def toggle_panel(self):
        """Toggle notification panel visibility."""
        self.show_panel = not self.show_panel
        if self.show_panel:
            return self.load_notifications

