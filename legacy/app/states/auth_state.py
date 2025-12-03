import reflex as rx
import asyncio
from sqlmodel import select
from app.models import User


class AuthState(rx.State):
    """State management for authentication."""

    user_id: int = -1
    user_name: str = ""
    user_email: str = ""
    user_profile_complete: bool = False
    token: str = ""
    is_authenticating: bool = False
    oauth_provider: str = "email"  # 'google' | 'email'
    google_id: str = ""
    google_email: str = ""
    avatar_url: str = ""
    oauth_url: str = ""
    
    @rx.var
    def google_oauth_url(self) -> str:
        """Get Google OAuth URL for direct link."""
        url = self._get_oauth_url()
        # Ensure we have a valid URL, not just "#"
        if url == "#":
            # Return a placeholder that will show an error
            return "/login?error=oauth_not_configured"
        return url
    
    def _get_oauth_url(self) -> str:
        """Helper to get OAuth URL."""
        import os
        from pathlib import Path
        from dotenv import load_dotenv
        import urllib.parse
        
        # Load .env file
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(env_path)
        else:
            load_dotenv()
        
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            return "#"
        
        base_url = os.getenv("APP_URL", "http://localhost:3000")
        callback_url = f"{base_url}/auth/callback"
        redirect_to = urllib.parse.quote(callback_url, safe='')
        return f"{supabase_url}/auth/v1/authorize?provider=google&redirect_to={redirect_to}"

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
        self.google_id = ""
        self.google_email = ""
        self.avatar_url = ""

    @rx.event
    async def check_auth(self):
        """Check authentication status from session/token and load user data."""
        # Reset authenticating state
        self.is_authenticating = False
        
        # Pre-generate OAuth URL on page load
        if not self.oauth_url:
            self.oauth_url = self._get_oauth_url()
        
        # If user_id is set, load user data from database
        if self.user_id > 0:
            with rx.session() as session:
                user = session.get(User, self.user_id)
                if user:
                    self.user_name = user.name
                    self.user_email = user.email
                    self.user_profile_complete = user.profile_complete
                    if user.oauth_provider:
                        self.oauth_provider = user.oauth_provider
                    if user.google_email:
                        self.google_email = user.google_email
                else:
                    # User doesn't exist, clear session
                    self._clear_session()

    @rx.event
    async def login(self, form_data: dict):
        """Handle login form submission - creates or finds user in database."""
        self.is_authenticating = True
        email = form_data.get("email", "").strip()
        if not email:
            self.is_authenticating = False
            return rx.toast.error("Email is required.")
        password = form_data.get("password", "")
        
        with rx.session() as session:
            # Find existing user or create new one
            user = session.exec(select(User).where(User.email == email)).first()
            
            if not user:
                # Create new user for demo purposes
                import bcrypt
                password_hash = bcrypt.hashpw(password.encode() if password else b"demo", bcrypt.gensalt()).decode()
                user = User(
                    email=email,
                    password_hash=password_hash,
                    name="Demo Employee",
                    profile_complete=False,
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            
            # Set session state
            self.user_id = user.id
            self.user_name = user.name
            self.user_email = user.email
            self.user_profile_complete = user.profile_complete
        
        self.is_authenticating = False
        return [
            rx.toast.success(f"Logged in as {self.user_name}"),
            rx.redirect("/dashboard"),
        ]

    @rx.event
    async def signup(self, form_data: dict):
        """Handle signup form submission - creates user in database."""
        self.is_authenticating = True
        email = form_data.get("email", "").strip()
        if not email:
            self.is_authenticating = False
            return rx.toast.error("Email is required.")
        name = form_data.get("name", "").strip()
        if not name:
            self.is_authenticating = False
            return rx.toast.error("Name is required.")
        password = form_data.get("password", "")
        
        with rx.session() as session:
            # Check if user already exists
            existing_user = session.exec(select(User).where(User.email == email)).first()
            if existing_user:
                self.is_authenticating = False
                return rx.toast.error("An account with this email already exists. Please sign in instead.")
            
            # Create new user
            import bcrypt
            password_hash = bcrypt.hashpw(password.encode() if password else b"demo", bcrypt.gensalt()).decode()
            user = User(
                email=email,
                password_hash=password_hash,
                name=name,
                profile_complete=False,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Set session state
            self.user_id = user.id
            self.user_name = user.name
            self.user_email = user.email
            self.user_profile_complete = False
        
        self.is_authenticating = False
        return [
            rx.toast.success(f"Account created! Welcome, {self.user_name}"),
            rx.redirect("/profile-setup"),
        ]

    @rx.event
    def logout(self):
        """Logout the user."""
        self._clear_session()
        # Force a hard reload to ensure all client-side state is cleared
        return rx.call_script("window.location.href = '/login'")

    @rx.event
    def ensure_auth_access(self):
        """Gatekeeper for protected routes - redirects to login if not authenticated."""
        # Only redirect if user is definitely not authenticated
        # check_auth should have run first to restore user_id from session
        if self.user_id == -1:
            return rx.redirect("/login")

    @rx.event
    async def change_password(self, form_data: dict):
        """Change user password (Mock)."""
        return rx.toast.success("Password updated successfully (Demo Mode).")

    @rx.event
    async def delete_account(self):
        """Delete the user account (Mock)."""
        self._clear_session()
        return [rx.toast.success("Account deleted (Demo Mode)."), rx.redirect("/login")]

    @rx.event
    async def sign_in_with_google(self):
        """
        Sign in with Google OAuth via Supabase.
        
        Note: This requires Supabase OAuth to be configured.
        See SUPABASE_OAUTH_SETUP.md for setup instructions.
        """
        import os
        from pathlib import Path
        from dotenv import load_dotenv
        
        # Load .env file explicitly
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(env_path)
        else:
            load_dotenv()
        
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            self.is_authenticating = False
            return rx.toast.error(
                "OAuth not configured. Please set SUPABASE_URL in .env file. "
                "See SUPABASE_OAUTH_SETUP.md for setup instructions."
            )
        
        # Construct Supabase OAuth URL with redirect back to our callback
        # Format: https://[project-ref].supabase.co/auth/v1/authorize?provider=google&redirect_to=[callback_url]
        import urllib.parse
        # Use localhost for local dev, or get from environment
        base_url = os.getenv("APP_URL", "http://localhost:3000")
        callback_url = f"{base_url}/auth/callback"
        redirect_to = urllib.parse.quote(callback_url, safe='')
        oauth_url = f"{supabase_url}/auth/v1/authorize?provider=google&redirect_to={redirect_to}"
        
        # Store URL and redirect immediately (no loading state needed for immediate redirect)
        self.oauth_url = oauth_url
        
        # Use window.location for redirect - happens immediately
        return rx.call_script(f"window.location.href = '{oauth_url}';")
    
    @rx.event
    async def handle_oauth_callback(self):
        """
        Handle OAuth callback from Supabase.
        This is called when the callback page loads.
        Returns a script to extract the token and redirect.
        """
        self.is_authenticating = False
        
        # Script to extract token and redirect
        script = """
        (function() {
            var checkCount = 0;
            
            function updateDebugInfo(msg) {
                // Debugging hidden from user unless they inspect element or have debug enabled
                console.log(msg);
            }

            function checkAndRedirect() {
                checkCount++;
                try {
                    updateDebugInfo("Checking token attempt " + checkCount);
                    
                    // Check hash (standard Supabase)
                    var hash = window.location.hash.substring(1);
                    var params = new URLSearchParams(hash);
                    var accessToken = params.get('access_token');
                    
                    // Check query params (fallback)
                    if (!accessToken) {
                        var search = new URLSearchParams(window.location.search);
                        accessToken = search.get('token');
                    }

                    // Debug output of what we found
                    updateDebugInfo("Hash present: " + (hash ? "yes" : "no"));
                    updateDebugInfo("Access token found: " + (accessToken ? "yes" : "no"));
                    
                    if (accessToken) {
                        updateDebugInfo("Token found! Redirecting...");
                        
                        // Construct redirect URL
                        var redirectUrl = '/auth/process?token=' + accessToken;
                        updateDebugInfo("Redirecting to: " + redirectUrl);
                        
                        window.location.replace(redirectUrl);
                    } else {
                        // Check for errors
                        var error = params.get('error');
                        if (!error) {
                            var search = new URLSearchParams(window.location.search);
                            error = search.get('error');
                        }
                        
                        if (error) {
                            updateDebugInfo("Error found: " + error);
                            window.location.replace('/login?error=' + error);
                            return;
                        }
                        
                        // If no token and no error, keep polling briefly (up to 4 seconds)
                        if (checkCount < 20) {
                            setTimeout(checkAndRedirect, 200);
                        } else {
                            // Stop polling, update UI only on failure
                            updateDebugInfo("Timed out waiting for token.");
                            console.log("Waiting for token...");
                            var statusMsg = document.getElementById('oauth-status-message');
                            if (statusMsg) statusMsg.innerText = "Taking longer than expected...";
                            
                            var manualBtn = document.getElementById('manual-check-btn');
                            if (manualBtn) manualBtn.style.display = 'block';
                        }
                    }
                } catch (e) {
                    console.error("Auth redirect error:", e);
                    updateDebugInfo("Error: " + e.message);
                }
            }
            
            // Run immediately and start polling
            setTimeout(checkAndRedirect, 50);
        })();
        """
        
        return rx.call_script(script)
    
    @rx.event
    async def process_oauth_token(self):
        """
        Process OAuth token from URL query parameter.
        Called from oauth_process_page on_load.
        """
        # Get token from router params - check both router params and query params
        # Reflex router params handling can be tricky with query strings
        access_token = self.router.page.params.get("token", "")
        
        # If empty, it might be due to how Reflex parses the initial load
        # We'll allow the client-side to pass it if needed, but for now log it
        print(f"DEBUG: Processing OAuth token: {access_token[:10] if access_token else 'None'}...")
        
        import os
        from pathlib import Path
        from dotenv import load_dotenv
        import requests
        
        # Load .env file
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(env_path)
        else:
            load_dotenv()
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not access_token or not supabase_url or not supabase_anon_key:
            # Check if we are stuck in a loop - if so, redirect to login
            self.is_authenticating = False
            print("DEBUG: Missing token or config, redirecting to login")
            return [
                rx.toast.error("Authentication failed: Missing token or configuration."),
                rx.redirect("/login"),
            ]
        
        try:
            self.is_authenticating = True
            
            # Get user info from Supabase using the access token
            headers = {
                "Authorization": f"Bearer {access_token}",
                "apikey": supabase_anon_key,
            }
            print("DEBUG: Verifying token with Supabase...")
            response = requests.get(f"{supabase_url}/auth/v1/user", headers=headers)
            
            if response.status_code != 200:
                print(f"DEBUG: Token verification failed: {response.status_code} - {response.text}")
                self.is_authenticating = False
                return [
                    rx.toast.error("Failed to verify Google account."),
                    rx.redirect("/login"),
                ]
            
            user_data = response.json()
            email = user_data.get("email", "")
            print(f"DEBUG: Token verified for email: {email}")
            name = user_data.get("user_metadata", {}).get("full_name", "") or user_data.get("user_metadata", {}).get("name", "") or email.split("@")[0]
            google_id = user_data.get("id", "")
            avatar_url = user_data.get("user_metadata", {}).get("avatar_url", "")
            
            if not email:
                self.is_authenticating = False
                return [
                    rx.toast.error("No email found in Google account."),
                    rx.redirect("/login"),
                ]
            
            # Create or update user in database
            with rx.session() as session:
                user = session.exec(select(User).where(User.email == email)).first()
                
                if not user:
                    # Create new user
                    print("DEBUG: Creating new user")
                    user = User(
                        email=email,
                        password_hash="oauth_user",  # Placeholder, not used for OAuth
                        name=name if name else "Google User",
                        profile_complete=False,
                        oauth_provider="google",
                        google_id=google_id,
                        google_email=email,
                        avatar_url=avatar_url,
                    )
                    session.add(user)
                    session.commit()
                    session.refresh(user)
                else:
                    # Update existing user with OAuth info
                    print("DEBUG: Updating existing user")
                    user.oauth_provider = "google"
                    user.google_id = google_id
                    user.google_email = email
                    if avatar_url:
                        user.avatar_url = avatar_url
                    if not user.name or user.name == "Google User":
                        user.name = name if name else email.split("@")[0]
                    session.add(user)
                    session.commit()
                    session.refresh(user)
                
                # Set session state
                self.user_id = user.id
                self.user_name = user.name
                self.user_email = user.email
                self.user_profile_complete = user.profile_complete
                self.oauth_provider = "google"
                self.google_id = google_id
                self.google_email = email
                if avatar_url:
                    self.avatar_url = avatar_url
            
            self.is_authenticating = False
            
            # Redirect based on profile completion
            print(f"DEBUG: Authentication successful, redirecting. Profile complete: {self.user_profile_complete}")
            if not self.user_profile_complete or not self.user_name or self.user_name == "Google User":
                return [
                    rx.toast.success("Successfully signed in with Google!"),
                    rx.redirect("/profile-setup"),
                ]
            
            return [
                rx.toast.success("Successfully signed in with Google!"),
                rx.redirect("/dashboard"),
            ]
            
        except Exception as e:
            import logging
            logging.exception(f"Error processing OAuth: {e}")
            print(f"DEBUG: Exception during OAuth processing: {e}")
            self.is_authenticating = False
            return [
                rx.toast.error(f"Error signing in with Google: {str(e)}"),
                rx.redirect("/login"),
            ]