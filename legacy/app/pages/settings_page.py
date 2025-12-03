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
                    rx.tabs.trigger(
                        "Edit Profile",
                        value="profile",
                        class_name="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 transition-all",
                    ),
                    rx.tabs.trigger(
                        "Password",
                        value="password",
                        class_name="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 transition-all",
                    ),
                    rx.tabs.trigger(
                        "Google Account",
                        value="google",
                        class_name="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 transition-all",
                    ),
                    rx.tabs.trigger(
                        "Account",
                        value="account",
                        class_name="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 transition-all",
                    ),
                    class_name="flex gap-4 border-b border-gray-200 mb-8",
                ),
                rx.tabs.content(
                    rx.el.div(profile_form(), class_name="max-w-3xl"), value="profile"
                ),
                rx.tabs.content(
                    rx.el.div(
                        rx.el.h3(
                            "Change Password",
                            class_name="text-lg font-semibold text-gray-900 mb-4",
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
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
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
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
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
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
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
                            "Google Account",
                            class_name="text-lg font-semibold text-gray-900 mb-4",
                        ),
                        rx.cond(
                            AuthState.oauth_provider == "google",
                            rx.el.div(
                                rx.el.div(
                                    rx.el.div(
                                        rx.el.div(
                                            rx.icon("mail", class_name="w-5 h-5 text-indigo-600"),
                                            class_name="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4",
                                        ),
                                        rx.el.div(
                                            rx.el.p(
                                                AuthState.user_email,
                                                class_name="font-semibold text-gray-900",
                                            ),
                                            rx.el.p(
                                                "Connected with Google",
                                                class_name="text-sm text-gray-500",
                                            ),
                                            class_name="flex-1",
                                        ),
                                        rx.el.div(
                                            rx.el.span(
                                                "Connected",
                                                class_name="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium",
                                            ),
                                            class_name="flex items-center",
                                        ),
                                        class_name="flex items-center p-4 bg-white rounded-xl border border-gray-200 mb-4",
                                    ),
                                    rx.el.div(
                                        rx.el.p(
                                            "Your Google account is connected. You can sign in with Google.",
                                            class_name="text-sm text-gray-600 mb-4",
                                        ),
                                        rx.el.button(
                                            "Unlink Google Account",
                                            class_name="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-50",
                                        ),
                                        class_name="bg-gray-50 p-6 rounded-xl border border-gray-200",
                                    ),
                                ),
                                class_name="max-w-2xl",
                            ),
                            rx.el.div(
                                rx.el.div(
                                    rx.el.div(
                                        rx.icon("mail", class_name="w-5 h-5 text-gray-400"),
                                        class_name="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4",
                                    ),
                                    rx.el.div(
                                        rx.el.p(
                                            "No Google account connected",
                                            class_name="font-semibold text-gray-900",
                                        ),
                                        rx.el.p(
                                            "Connect your Google account to sign in faster and sync your profile.",
                                            class_name="text-sm text-gray-500",
                                        ),
                                        class_name="flex-1",
                                    ),
                                    rx.el.button(
                                        "Connect Google Account",
                                        on_click=AuthState.sign_in_with_google,
                                        class_name="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700",
                                    ),
                                    class_name="flex items-center p-4 bg-white rounded-xl border border-gray-200",
                                ),
                                class_name="max-w-2xl",
                            ),
                        ),
                    ),
                    value="google",
                ),
                rx.tabs.content(
                    rx.el.div(
                        rx.el.div(
                            rx.el.div(
                                rx.icon("alert-triangle", class_name="w-6 h-6 text-red-500 mb-3"),
                                rx.el.h3(
                                    "Danger Zone",
                                    class_name="text-xl font-bold text-red-600 mb-2",
                                ),
                                rx.el.p(
                                    "Permanently delete your account and all associated data. This action cannot be undone.",
                                    class_name="text-gray-600 text-sm leading-relaxed",
                                ),
                                class_name="mb-6",
                            ),
                            rx.el.div(
                                rx.el.div(
                                    rx.el.div(
                                        rx.el.p(
                                            "⚠️ What will be deleted:",
                                            class_name="font-semibold text-gray-900 mb-2",
                                        ),
                                        rx.el.ul(
                                            rx.el.li("Your profile and preferences", class_name="text-sm text-gray-600 mb-1"),
                                            rx.el.li("All pod memberships and working circles", class_name="text-sm text-gray-600 mb-1"),
                                            rx.el.li("Session logs and enablement history", class_name="text-sm text-gray-600 mb-1"),
                                            rx.el.li("All compatibility scores and matches", class_name="text-sm text-gray-600"),
                                            class_name="list-disc list-inside space-y-1 mb-6",
                                        ),
                                    ),
                                    class_name="bg-white p-5 rounded-xl border border-gray-200 mb-6",
                                ),
                                rx.el.button(
                                    rx.icon("trash-2", class_name="w-5 h-5 mr-2"),
                                    "Delete My Account Permanently",
                                    on_click=AuthState.delete_account,
                                    class_name="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center",
                                ),
                                class_name="max-w-lg",
                            ),
                            class_name="max-w-2xl",
                        ),
                    ),
                    value="account",
                ),
                default_value="profile",
            ),
            class_name="p-4 md:p-8",
        )
    )
