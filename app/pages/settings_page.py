import reflex as rx
from app.components.sidebar import layout
from app.components.profile_ui import profile_form
from app.states.auth_state import AuthState
from app.states.profile_state import ProfileState


def settings_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.h1("Settings", class_name="text-2xl font-bold text-gray-900 mb-6"),
            rx.tabs.root(
                rx.tabs.list(
                    rx.tabs.trigger("Edit Profile", value="profile"),
                    rx.tabs.trigger("Password", value="password"),
                    rx.tabs.trigger("Account", value="account"),
                    class_name="flex gap-4 border-b border-gray-200 mb-6",
                ),
                rx.tabs.content(
                    rx.el.div(profile_form(), class_name="max-w-3xl"), value="profile"
                ),
                rx.tabs.content(
                    rx.el.div(
                        rx.el.h3(
                            "Change Password", class_name="text-lg font-semibold mb-4"
                        ),
                        rx.el.form(
                            rx.el.div(
                                rx.el.label(
                                    "Current Password",
                                    class_name="block text-sm font-medium text-gray-700 mb-1",
                                ),
                                rx.el.input(
                                    type="password",
                                    name="current_password",
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4",
                                ),
                            ),
                            rx.el.div(
                                rx.el.label(
                                    "New Password",
                                    class_name="block text-sm font-medium text-gray-700 mb-1",
                                ),
                                rx.el.input(
                                    type="password",
                                    name="new_password",
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4",
                                ),
                            ),
                            rx.el.div(
                                rx.el.label(
                                    "Confirm New Password",
                                    class_name="block text-sm font-medium text-gray-700 mb-1",
                                ),
                                rx.el.input(
                                    type="password",
                                    name="confirm_new_password",
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6",
                                ),
                            ),
                            rx.el.button(
                                "Update Password",
                                type="submit",
                                class_name="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700",
                            ),
                            on_submit=AuthState.change_password,
                            class_name="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md",
                        ),
                    ),
                    value="password",
                ),
                rx.tabs.content(
                    rx.el.div(
                        rx.el.h3(
                            "Danger Zone",
                            class_name="text-lg font-semibold text-red-600 mb-4",
                        ),
                        rx.el.div(
                            rx.el.p(
                                "Once you delete your account, there is no going back. Please be certain.",
                                class_name="text-gray-600 mb-4",
                            ),
                            rx.el.button(
                                "Delete Account",
                                on_click=rx.window_alert(
                                    "Are you sure you want to delete your account?"
                                ),
                                class_name="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100",
                            ),
                            rx.el.button(
                                "Delete My Account Permanently",
                                on_click=AuthState.delete_account,
                                class_name="mt-4 block bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700",
                            ),
                            class_name="bg-red-50/50 p-6 rounded-xl border border-red-100 max-w-md",
                        ),
                    ),
                    value="account",
                ),
                default_value="profile",
            ),
            class_name="p-4 md:p-8",
        )
    )