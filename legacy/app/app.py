import reflex as rx
import reflex_enterprise as rxe
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env file at startup
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

from app.pages.auth_pages import login_page, signup_page
from app.pages.profile_pages import profile_setup_page, profile_edit_page
from app.pages.class_pages import (
    classes_list_page,
    create_class_page,
    join_class_page,
    class_dashboard_page,
)
from app.pages.landing_page import landing_page
from app.pages.notifications_page import notifications_page
from app.states.auth_state import AuthState
from app.states.class_state import ClassState
from app.states.profile_state import ProfileState
from app.states.notification_state import NotificationState
from app.utils.db_init import init_db

init_db()
app = rxe.App(
    theme=rx.theme(appearance="inherit"),
    head_components=[
        rx.el.link(rel="preconnect", href="https://fonts.googleapis.com"),
        rx.el.link(rel="preconnect", href="https://fonts.gstatic.com", cross_origin=""),
        rx.el.link(
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            rel="stylesheet",
        ),
        rx.el.style("""
            /* 
             * Note: Browser extensions may cause console errors/warnings (e.g., failed resource loads).
             * These are harmless and don't affect app functionality. They can be safely ignored.
             */
            
            /* Radix UI Select - Match Reflex Dev Default Styling */
            :root {
                --color-surface: rgb(255, 255, 255);
            }
            
            /* Select Trigger - White background, visible border, dark text */
            .rt-SelectTrigger {
                background-color: rgb(255, 255, 255) !important;
                background: rgb(255, 255, 255) !important;
                color: rgb(17, 24, 39) !important;
                border: 1px solid rgb(209, 213, 219) !important;
                cursor: pointer !important;
            }
            
            .rt-SelectTrigger::before {
                background-color: rgb(255, 255, 255) !important;
                background: rgb(255, 255, 255) !important;
            }
            
            /* Select Content (Dropdown Menu) - White background */
            .rt-SelectContent {
                background-color: rgb(255, 255, 255) !important;
                background: rgb(255, 255, 255) !important;
                border: 1px solid rgb(209, 213, 219) !important;
                box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08) !important;
            }
            
            /* Select Viewport - White background */
            .rt-SelectViewport {
                background-color: rgb(255, 255, 255) !important;
                background: rgb(255, 255, 255) !important;
                border-radius: 0.5rem !important;
            }
            
            /* Select Items - White background, dark text */
            .rt-SelectItem {
                color: rgb(17, 24, 39) !important;
                background-color: rgb(255, 255, 255) !important;
                background: rgb(255, 255, 255) !important;
                cursor: pointer !important;
            }
            
            /* Hover state - Light blue/indigo highlight */
            .rt-SelectItem:hover,
            .rt-SelectItem[data-highlighted] {
                background-color: rgb(238, 242, 255) !important;
                background: rgb(238, 242, 255) !important;
                color: rgb(67, 56, 202) !important;
            }
            
            /* Selected/Checked state */
            .rt-SelectItem[data-state="checked"] {
                background-color: rgb(238, 242, 255) !important;
                background: rgb(238, 242, 255) !important;
                color: rgb(67, 56, 202) !important;
            }

            /* Strengths & Goals checkboxes - white background, subtle grey border */
            .rt-CheckboxRoot {
                background-color: rgb(255, 255, 255) !important;
                border: 1px solid transparent !important;
                cursor: pointer !important;
            }
            .rt-CheckboxRoot[data-state="unchecked"]::before {
                background-color: rgb(255, 255, 255) !important;
                box-shadow: inset 0 0 0 1px rgb(209, 213, 219) !important;
                border-radius: 4px !important;
            }
            .rt-CheckboxRoot[data-state="checked"]::before {
                background-color: rgb(99, 102, 241) !important;
                box-shadow: none !important;
                border-radius: 4px !important;
            }

            /* Global input/textarea styling */
            input,
            textarea {
                color: #111827 !important; /* Black text, not gray */
                caret-color: #111827 !important;
                text-align: left !important;
            }
            input::placeholder,
            textarea::placeholder {
                color: #6b7280 !important;
            }
            input:focus::placeholder,
            textarea:focus::placeholder {
                color: transparent !important;
            }
            input[type="text"]:focus,
            input[type="password"]:focus,
            input[type="email"]:focus,
            textarea:focus {
                color: #111827 !important; /* Ensure text stays black on focus */
                border-color: #4F46E5 !important;
                box-shadow: 0 0 0 1px #4F46E5 !important;
                outline: none !important;
            }

            /* Animated Background Grid */
            @keyframes grid-move {
                0% { background-position: 0 0; }
                100% { background-position: 40px 40px; }
            }
            .bg-grid-pattern {
                background-size: 40px 40px;
                background-image: linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
                animation: grid-move 20s linear infinite;
            }

            .bg-dot-pattern {
                background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
                background-size: 24px 24px;
            }
            
            /* Animations */
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
                animation: blob 7s infinite;
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
            .animation-delay-4000 {
                animation-delay: 4s;
            }
            
            @keyframes gradient-x {
                0%, 100% {
                    background-size: 200% 200%;
                    background-position: left center;
                }
                50% {
                    background-size: 200% 200%;
                    background-position: right center;
                }
            }
            .animate-gradient-x {
                animation: gradient-x 3s ease infinite;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
        """),
    ],
)
app.add_page(login_page, route="/login", on_load=AuthState.check_auth)
app.add_page(signup_page, route="/signup", on_load=AuthState.check_auth)
app.add_page(
    profile_setup_page,
    route="/profile-setup",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    profile_edit_page,
    route="/profile/edit",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ProfileState.load_profile,
    ],
)
app.add_page(
    landing_page,
    route="/",
    on_load=[],
)
app.add_page(
    classes_list_page,
    route="/dashboard",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_user_classes,
        NotificationState.load_notifications,
    ],
)
app.add_page(
    classes_list_page,
    route="/classes",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_user_classes,
        NotificationState.load_notifications,
    ],
)
app.add_page(
    create_class_page,
    route="/classes/create",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    join_class_page,
    route="/classes/join",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    class_dashboard_page,
    route="/classes/[class_id]",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_class_details,
        NotificationState.load_notifications,
    ],
)
app.add_page(
    notifications_page,
    route="/notifications",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        NotificationState.load_notifications,
    ],
)
from app.pages.micro_group_pages import (
    my_groups_page,
    create_group_page,
    join_group_page,
    group_dashboard_page,
)
from app.states.micro_group_state import MicroGroupState
from app.pages.settings_page import settings_page
from app.pages.about_page import about_page

app.add_page(
    landing_page,
    route="/landing",
    on_load=[],
)
app.add_page(
    my_groups_page,
    route="/groups",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        MicroGroupState.load_user_groups,
    ],
)
app.add_page(
    create_group_page,
    route="/groups/create",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    join_group_page,
    route="/groups/join",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    group_dashboard_page,
    route="/groups/[group_id]",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        MicroGroupState.load_group_details,
    ],
)
app.add_page(
    settings_page,
    route="/settings",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ProfileState.load_profile,
    ],
)
app.add_page(about_page, route="/about", on_load=[AuthState.check_auth])

# OAuth callback route - extracts token from hash and redirects to process page
def oauth_callback_page() -> rx.Component:
    """Handle OAuth callback from Supabase - redirect to process page with token in query param."""
    return rx.el.div(
        rx.el.div(
            rx.spinner(size="3", class_name="mb-4"),
            rx.el.p(
                "Securely logging you in...", 
                id="oauth-status-message",
                class_name="text-gray-600 font-medium text-lg"
            ),
            # Debug info hidden by default, visible only if there's an issue
            rx.el.div(
                "",
                id="debug-info",
                class_name="mt-4 text-xs text-gray-400 font-mono whitespace-pre-wrap max-w-lg overflow-hidden",
                style={"display": "none"} 
            ),
            rx.el.button(
                "Click here if not redirected",
                id="manual-check-btn",
                class_name="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm",
                style={"display": "none"},
                on_click=rx.call_script("window.location.reload()"),
            ),
            class_name="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in",
        ),
        class_name="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm",
    )

# OAuth processing page - processes token via backend event
def oauth_process_page() -> rx.Component:
    """Process OAuth token extracted from URL."""
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.div(
                    class_name="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
                ),
                class_name="mb-6"
            ),
            rx.el.h2("Connecting to Meshflow", class_name="text-xl font-bold text-gray-900 mb-2"),
            rx.el.p("Securely verifying your account...", class_name="text-gray-500 font-medium"),
            class_name="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full",
        ),
        class_name="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm",
    )

app.add_page(oauth_callback_page, route="/auth/callback", on_load=AuthState.handle_oauth_callback)
app.add_page(oauth_process_page, route="/auth/process", on_load=AuthState.process_oauth_token)