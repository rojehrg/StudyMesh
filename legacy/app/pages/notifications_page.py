import reflex as rx
from app.components.sidebar import layout
from app.states.notification_state import NotificationState, NotificationModel


def notification_card(notification: NotificationModel) -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.icon("bell", class_name="w-5 h-5 text-indigo-600"),
                class_name=rx.cond(
                    notification.read,
                    "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center",
                    "w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center",
                ),
            ),
            rx.el.div(
                rx.el.p(
                    notification.content,
                    class_name="text-sm font-medium text-gray-900",
                ),
                rx.el.p(
                    f"From {notification.sender_name} • {notification.created_at}",
                    class_name="text-xs text-gray-500 mt-1",
                ),
                class_name="flex-1 ml-4",
            ),
            rx.cond(
                ~notification.read,
                rx.el.button(
                    rx.icon("check", class_name="w-4 h-4"),
                    on_click=lambda: NotificationState.mark_as_read(notification.id),
                    class_name="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors",
                    title="Mark as read",
                ),
            ),
            class_name="flex items-start p-4",
        ),
        class_name=rx.cond(
            notification.read,
            "bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors",
            "bg-indigo-50/30 border-b border-indigo-100 hover:bg-indigo-50/50 transition-colors",
        ),
    )


def notifications_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h1("Notifications", class_name="text-2xl font-bold text-gray-900"),
                rx.cond(
                    NotificationState.unread_count > 0,
                    rx.el.button(
                        "Mark all as read",
                        on_click=NotificationState.mark_all_read,
                        class_name="text-sm text-indigo-600 hover:text-indigo-800 font-medium",
                    ),
                ),
                class_name="flex justify-between items-center mb-6",
            ),
            rx.el.div(
                rx.cond(
                    NotificationState.notifications,
                    rx.el.div(
                        rx.foreach(
                            NotificationState.notifications,
                            notification_card
                        ),
                        class_name="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
                    ),
                    rx.el.div(
                        rx.icon("bell-off", class_name="w-16 h-16 text-gray-300 mb-4"),
                        rx.el.h3(
                            "All caught up",
                            class_name="text-lg font-medium text-gray-900 mb-2",
                        ),
                        rx.el.p(
                            "You have no new notifications.",
                            class_name="text-gray-500",
                        ),
                        class_name="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300",
                    ),
                ),
            ),
            class_name="p-8 max-w-4xl mx-auto",
        )
    )

