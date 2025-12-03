import reflex as rx
from app.states.auth_state import AuthState
from app.states.layout_state import LayoutState
from app.states.notification_state import NotificationState


def sidebar_item(icon: str, text: str, href: str, badge_count: int = 0) -> rx.Component:
    return rx.el.a(
        rx.el.div(
            rx.icon(icon, class_name="w-5 h-5 shrink-0"),
            rx.cond(
                badge_count > 0,
                rx.el.span(
                    badge_count,
                    class_name=rx.cond(
                        LayoutState.sidebar_collapsed,
                        "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10",
                        "ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full"
                    )
                )
            ),
            class_name="relative flex items-center"
        ),
        rx.el.div(
            rx.el.span(text, class_name="font-medium whitespace-nowrap"),
            class_name=rx.cond(
                LayoutState.sidebar_collapsed,
                "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out",
                "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out"
            ),
        ),
        href=href,
        class_name=rx.cond(
            (rx.State.router.page.path == href) | 
            (
                (href == "/classes") & 
                rx.State.router.page.path.startswith("/classes/") & 
                (rx.State.router.page.path != "/classes/create") & 
                (rx.State.router.page.path != "/classes/join")
            ),
            (
                "flex items-center gap-3 px-4 py-3 rounded-xl border "
                "bg-indigo-50 text-indigo-700 border-gray-200 "
                "transition-all overflow-hidden whitespace-nowrap"
            ),
            (
                "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent "
                "text-gray-500 "
                "transition-all hover:border-gray-200 "
                "hover:bg-indigo-50 "
                "hover:text-indigo-700 "
                "overflow-hidden whitespace-nowrap"
            ),
        ),
        on_click=LayoutState.close_sidebar,
        title=rx.cond(LayoutState.sidebar_collapsed, text, ""),
    )


def sidebar_content() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.a(
                    rx.el.div(
                        rx.el.span("M", class_name="text-indigo-600 text-xl font-bold"),
                        class_name=rx.cond(
                            LayoutState.sidebar_collapsed,
                            "w-8 flex items-center justify-center shrink-0 opacity-100 transition-all duration-300 ease-in-out",
                            "w-0 max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out" 
                        ),
                    ),
                    rx.el.div(
                        rx.el.div(
                            rx.el.span("Mesh", class_name="text-indigo-600"),
                            rx.el.span("flow", class_name="text-gray-900"),
                            class_name="text-xl font-bold whitespace-nowrap",
                        ),
                        class_name=rx.cond(
                            LayoutState.sidebar_collapsed,
                            "max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out",
                            "max-w-[200px] opacity-100 transition-all duration-300 ease-in-out" 
                        ),
                    ),
                    href="/landing",
                    class_name="hover:opacity-80 transition-opacity cursor-pointer flex items-center h-8",
                ),
                class_name="px-4 pt-6 pb-4",
            ),
            rx.el.nav(
                sidebar_item("layout-dashboard", "Dashboard", "/dashboard"),
                sidebar_item("book-open", "Pods", "/classes"),
                sidebar_item("users", "Working Circles", "/groups"),
                sidebar_item("bell", "Notifications", "/notifications", badge_count=NotificationState.unread_count),
                sidebar_item("circle_plus", "Create Pod", "/classes/create"),
                sidebar_item("log-in", "Join Pod", "/classes/join"),
                sidebar_item("settings", "Workspace Settings", "/settings"),
                sidebar_item("info", "About Meshflow", "/about"),
                class_name="flex flex-col gap-1 px-2",
            ),
            class_name="flex-1 overflow-x-hidden",
        ),
        rx.el.div(
            rx.el.div(
                rx.el.div(
                    rx.el.div(
                        rx.cond(
                            AuthState.user_name,
                            rx.el.span(
                                AuthState.user_name[0],
                                class_name="text-sm font-semibold",
                            ),
                            rx.el.span(
                                "U",
                                class_name="text-sm font-semibold",
                            ),
                        ),
                        class_name="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0",
                    ),
                    class_name="flex items-center justify-center",
                ),
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
                        class_name="flex-1 min-w-0 ml-3",
                    ),
                    rx.el.button(
                        rx.icon(
                            "log-out",
                            class_name="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors",
                        ),
                        on_click=AuthState.logout,
                        class_name="p-2 ml-2",
                    ),
                    class_name=rx.cond(
                        LayoutState.sidebar_collapsed,
                        "max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out",
                        "flex items-center w-full max-w-[200px] opacity-100 transition-all duration-300 ease-in-out"
                    ),
                ),
                class_name="flex items-center p-4 border-t border-gray-100",
            ),
            class_name="mt-auto overflow-x-hidden",
        ),
        class_name="flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
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
    """Main layout with responsive sidebar and collapse functionality."""
    return rx.el.div(
        mobile_sidebar(),
        rx.el.aside(
            sidebar_content(),
            class_name=rx.cond(
                LayoutState.sidebar_collapsed,
                "hidden md:flex w-20 flex-col border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ease-in-out",
                "hidden md:flex w-64 flex-col border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ease-in-out",
            ),
        ),
        rx.el.div(
            rx.el.header(
                rx.el.button(
                    rx.icon("menu", class_name="w-6 h-6 text-gray-700"),
                    on_click=LayoutState.toggle_sidebar,
                    class_name="p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100",
                ),
                rx.el.a(
                    "Meshflow",
                    href="/landing",
                    class_name="text-lg font-bold text-indigo-600 hover:opacity-80 transition-opacity",
                ),
                class_name="md:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30",
            ),
            rx.el.main(
                child,
                class_name="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-auto transition-all duration-300",
            ),
            class_name="flex-1 flex flex-col min-w-0",
        ),
        rx.el.button(
            rx.icon(
                "chevron-left",
                class_name=rx.cond(
                    LayoutState.sidebar_collapsed,
                    "w-5 h-5 rotate-180 transition-transform duration-300",
                    "w-5 h-5 transition-transform duration-300",
                ),
            ),
            on_click=LayoutState.toggle_sidebar_collapse,
            class_name=(
                "hidden md:flex fixed top-1/2 -translate-y-1/2 z-[60] "
                "bg-white border border-l-0 border-gray-200 "
                "rounded-r-lg p-2 shadow-lg hover:shadow-xl "
                "text-gray-700 hover:text-indigo-600 "
                "transition-all duration-300 hover:bg-gray-50 "
                "cursor-pointer items-center justify-center"
            ),
            style=rx.cond(
                LayoutState.sidebar_collapsed,
                {"left": "5rem", "transition": "left 0.3s ease-in-out"},
                {"left": "16rem", "transition": "left 0.3s ease-in-out"},
            ),
        ),
        class_name="flex w-full min-h-screen bg-gray-50",
    )
