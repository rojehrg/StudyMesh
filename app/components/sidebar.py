import reflex as rx
from app.states.auth_state import AuthState
from app.states.layout_state import LayoutState


def sidebar_item(icon: str, text: str, href: str) -> rx.Component:
    return rx.el.a(
        rx.icon(icon, class_name="w-5 h-5 text-gray-500"),
        rx.el.span(text, class_name="font-medium text-gray-700"),
        href=href,
        class_name="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all group",
        on_click=LayoutState.close_sidebar,
    )


def sidebar_content() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.span("Class", class_name="text-indigo-600"),
                rx.el.span("Companion", class_name="text-gray-900"),
                class_name="text-xl font-bold px-4 py-6",
            ),
            rx.el.nav(
                sidebar_item("layout-dashboard", "Dashboard", "/"),
                sidebar_item("book-open", "My Classes", "/classes"),
                sidebar_item("users", "My Groups", "/groups"),
                sidebar_item("circle_plus", "Create Class", "/classes/create"),
                sidebar_item("log-in", "Join Class", "/classes/join"),
                sidebar_item("settings", "Settings", "/settings"),
                sidebar_item("info", "About", "/about"),
                class_name="flex flex-col gap-1 px-2",
            ),
            class_name="flex-1",
        ),
        rx.el.div(
            rx.el.div(
                rx.el.div(
                    rx.el.p(
                        AuthState.user_name,
                        class_name="font-medium text-sm text-gray-900 truncate",
                    ),
                    rx.el.p(
                        AuthState.user_email,
                        class_name="text-xs text-gray-500 truncate",
                    ),
                    class_name="flex-1 min-w-0",
                ),
                rx.el.button(
                    rx.icon(
                        "log-out",
                        class_name="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors",
                    ),
                    on_click=AuthState.logout,
                    class_name="p-2",
                ),
                class_name="flex items-center gap-3 p-4 border-t border-gray-100",
            ),
            class_name="mt-auto",
        ),
        class_name="flex flex-col h-full bg-white",
    )


def mobile_sidebar() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            class_name="fixed inset-0 bg-black/50 z-40",
            on_click=LayoutState.close_sidebar,
            display=rx.cond(LayoutState.sidebar_open, "block", "none"),
        ),
        rx.el.aside(
            sidebar_content(),
            class_name=rx.cond(
                LayoutState.sidebar_open,
                "fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl transition-transform transform translate-x-0",
                "fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl transition-transform transform -translate-x-full",
            ),
        ),
    )


def layout(child: rx.Component) -> rx.Component:
    """Main layout with responsive sidebar."""
    return rx.el.div(
        mobile_sidebar(),
        rx.el.aside(
            sidebar_content(),
            class_name="hidden md:flex w-64 flex-col border-r border-gray-200 h-screen sticky top-0",
        ),
        rx.el.div(
            rx.el.header(
                rx.el.button(
                    rx.icon("menu", class_name="w-6 h-6 text-gray-700"),
                    on_click=LayoutState.toggle_sidebar,
                    class_name="p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100",
                ),
                rx.el.span(
                    "Class Companion", class_name="text-lg font-bold text-indigo-600"
                ),
                rx.color_mode.button(class_name="ml-auto text-gray-500"),
                class_name="md:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30",
            ),
            rx.el.main(
                child,
                class_name="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-auto",
            ),
            class_name="flex-1 flex flex-col min-w-0",
        ),
        class_name="flex w-full min-h-screen bg-gray-50",
    )