import reflex as rx
import asyncio


class AuthState(rx.State):
    """State management for authentication (Mocked for Demo)."""

    user_id: int = 1
    user_name: str = "Demo Student"
    user_email: str = "demo@university.edu"
    user_profile_complete: bool = True
    token: str = ""
    is_authenticating: bool = False

    @rx.var
    def is_authenticated(self) -> bool:
        """Check if user is authenticated based on user_id."""
        return self.user_id != -1

    def _clear_session(self):
        """Clear all session data."""
        self.user_id = -1
        self.user_name = ""
        self.user_email = ""
        self.user_profile_complete = False
        self.token = ""

    @rx.event
    async def check_auth(self):
        """Mock check_auth - always authenticated by default."""
        pass

    @rx.event
    async def login(self, form_data: dict):
        """Handle login form submission (Mock)."""
        self.is_authenticating = True
        await asyncio.sleep(0.5)
        self.user_id = 1
        self.user_name = "Demo Student"
        self.user_email = form_data.get("email", "demo@university.edu")
        self.user_profile_complete = True
        self.is_authenticating = False
        return [
            rx.toast.success("Logged in as Demo Student (Demo Mode)"),
            rx.redirect("/"),
        ]

    @rx.event
    async def signup(self, form_data: dict):
        """Handle signup form submission (Mock)."""
        self.is_authenticating = True
        await asyncio.sleep(0.5)
        self.user_id = 1
        self.user_name = form_data.get("name", "Demo Student")
        self.user_email = form_data.get("email", "demo@university.edu")
        self.user_profile_complete = False
        self.is_authenticating = False
        return [
            rx.toast.success("Account created (Demo Mode)"),
            rx.redirect("/profile-setup"),
        ]

    @rx.event
    def logout(self):
        """Logout the user."""
        self._clear_session()
        return rx.redirect("/login")

    @rx.event
    def ensure_auth_access(self):
        """Gatekeeper for protected routes (Bypassed for Demo)."""
        pass

    @rx.event
    async def change_password(self, form_data: dict):
        """Change user password (Mock)."""
        return rx.toast.success("Password updated successfully (Demo Mode).")

    @rx.event
    async def delete_account(self):
        """Delete the user account (Mock)."""
        self._clear_session()
        return [rx.toast.success("Account deleted (Demo Mode)."), rx.redirect("/login")]