import reflex as rx
from app.states.auth_state import AuthState


def auth_layout(child: rx.Component) -> rx.Component:
    """Shared layout for auth pages."""
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.h1(
                    "Meshflow",
                    class_name="text-3xl font-bold text-indigo-600 mb-2",
                ),
                rx.el.p(
                    "Empower teams to share expertise and close enablement gaps.",
                    class_name="text-gray-500 text-center mb-8",
                ),
                child,
                class_name="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center border border-gray-100",
            ),
            class_name="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 px-4",
        ),
        class_name="w-full min-h-screen font-['Inter']",
    )


def login_form() -> rx.Component:
    return rx.el.form(
        rx.el.div(
            rx.el.label(
                "Work Email",
                class_name="block text-sm font-medium text-gray-700 mb-1",
            ),
            rx.el.input(
                placeholder="you@company.com",
                type="email",
                name="email",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-4",
        ),
        rx.el.div(
            rx.el.div(
                rx.el.label(
                    "Password",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.a(
                    "Forgot password?",
                    href="#",
                    class_name="text-xs text-indigo-600 hover:text-indigo-800",
                ),
                class_name="flex justify-between items-center",
            ),
            rx.el.input(
                placeholder="••••••••",
                type="password",
                name="password",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-6",
        ),
        rx.el.div(
            rx.el.div(
                rx.el.div(
                    class_name="flex-1 border-t border-gray-300",
                ),
                rx.el.span(
                    "OR",
                    class_name="px-4 text-sm text-gray-500",
                ),
                rx.el.div(
                    class_name="flex-1 border-t border-gray-300",
                ),
                class_name="flex items-center my-6",
            ),
            rx.el.a(
                rx.icon("mail", class_name="w-5 h-5 mr-2"),
                "Sign in with Google",
                href=AuthState.google_oauth_url,
                target="_self",
                class_name="w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center mb-4 no-underline cursor-pointer",
            ),
            class_name="w-full",
        ),
        rx.el.button(
            rx.cond(
                AuthState.is_authenticating,
                "Signing in...",
                "Sign In",
            ),
            type="submit",
            disabled=AuthState.is_authenticating,
            class_name="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed",
        ),
        rx.el.div(
            "Don't have an account? ",
            rx.el.a(
                "Sign up",
                href="/signup",
                class_name="text-indigo-600 font-semibold hover:underline",
            ),
            class_name="mt-6 text-center text-sm text-gray-600",
        ),
        class_name="w-full",
        on_submit=AuthState.login,
    )


def signup_form() -> rx.Component:
    return rx.el.form(
        rx.el.div(
            rx.el.label(
                "Full Name", class_name="block text-sm font-medium text-gray-700 mb-1"
            ),
            rx.el.input(
                placeholder="Jordan Rivera",
                type="text",
                name="name",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-4",
        ),
        rx.el.div(
            rx.el.label(
                "Work Email",
                class_name="block text-sm font-medium text-gray-700 mb-1",
            ),
            rx.el.input(
                placeholder="you@company.com",
                type="email",
                name="email",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-4",
        ),
        rx.el.div(
            rx.el.label(
                "Password", class_name="block text-sm font-medium text-gray-700 mb-1"
            ),
            rx.el.input(
                placeholder="Create a password",
                type="password",
                name="password",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-4",
        ),
        rx.el.div(
            rx.el.label(
                "Confirm Password",
                class_name="block text-sm font-medium text-gray-700 mb-1",
            ),
            rx.el.input(
                placeholder="Confirm your password",
                type="password",
                name="confirm_password",
                required=True,
                class_name="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",
            ),
            class_name="w-full mb-6",
        ),
        rx.el.div(
            rx.el.div(
                rx.el.div(
                    class_name="flex-1 border-t border-gray-300",
                ),
                rx.el.span(
                    "OR",
                    class_name="px-4 text-sm text-gray-500",
                ),
                rx.el.div(
                    class_name="flex-1 border-t border-gray-300",
                ),
                class_name="flex items-center my-6",
            ),
            rx.el.a(
                rx.icon("mail", class_name="w-5 h-5 mr-2"),
                "Sign up with Google",
                href=AuthState.google_oauth_url,
                target="_self",
                class_name="w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center mb-4 no-underline cursor-pointer",
            ),
            class_name="w-full",
        ),
        rx.el.button(
            rx.cond(
                AuthState.is_authenticating,
                "Creating Account...",
                "Create Account",
            ),
            type="submit",
            disabled=AuthState.is_authenticating,
            class_name="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed",
        ),
        rx.el.div(
            "Already have an account? ",
            rx.el.a(
                "Sign in",
                href="/login",
                class_name="text-indigo-600 font-semibold hover:underline",
            ),
            class_name="mt-6 text-center text-sm text-gray-600",
        ),
        class_name="w-full",
        on_submit=AuthState.signup,
    )