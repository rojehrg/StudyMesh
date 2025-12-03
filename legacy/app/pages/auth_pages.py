import reflex as rx
from app.components.auth_ui import auth_layout, login_form, signup_form
from app.states.auth_state import AuthState


def login_page() -> rx.Component:
    return auth_layout(
        rx.el.div(
            rx.el.h2(
                "Welcome Back", class_name="text-xl font-semibold text-gray-800 mb-6"
            ),
            login_form(),
            class_name="w-full flex flex-col items-center",
        )
    )


def signup_page() -> rx.Component:
    return auth_layout(
        rx.el.div(
            rx.el.h2(
                "Create Account", class_name="text-xl font-semibold text-gray-800 mb-6"
            ),
            signup_form(),
            class_name="w-full flex flex-col items-center",
        )
    )