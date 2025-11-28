import reflex as rx
from app.components.profile_ui import profile_form
from app.states.profile_state import ProfileState
from app.components.sidebar import layout


def profile_setup_page() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.h1(
                    "Complete Your Profile",
                    class_name="text-3xl font-bold text-gray-900 mb-4 text-center",
                ),
                rx.el.p(
                    "We need a few details to match you with the best study partners.",
                    class_name="text-gray-600 mb-8 text-center",
                ),
                profile_form(),
                class_name="max-w-4xl mx-auto px-4 py-12",
            ),
            class_name="min-h-screen bg-gray-50 font-['Inter']",
        )
    )


def profile_edit_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.h1(
                "Edit Profile", class_name="text-2xl font-bold text-gray-900 mb-6"
            ),
            profile_form(),
            class_name="max-w-4xl mx-auto p-6",
        )
    )