import reflex as rx
from app.components.sidebar import layout
from app.states.micro_group_state import MicroGroupState
from app.components.micro_group_ui import (
    group_card,
    create_group_form,
    invite_section,
    member_list,
    group_stats,
)
from app.states.class_state import ClassState


def my_groups_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h1(
                    "My Study Groups", class_name="text-2xl font-bold text-gray-900"
                ),
                rx.el.div(
                    rx.el.a(
                        "Join via Code",
                        href="/groups/join",
                        class_name="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors",
                    ),
                    class_name="flex gap-3",
                ),
                class_name="flex justify-between items-center mb-8",
            ),
            rx.cond(
                MicroGroupState.user_groups,
                rx.el.div(
                    rx.foreach(MicroGroupState.user_groups, group_card),
                    class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                ),
                rx.el.div(
                    rx.icon("users", class_name="w-16 h-16 text-gray-300 mb-4"),
                    rx.el.h3(
                        "No study groups yet",
                        class_name="text-lg font-medium text-gray-900 mb-2",
                    ),
                    rx.el.p(
                        "Create a group from your class dashboard or join one with a code.",
                        class_name="text-gray-500 mb-6",
                    ),
                    class_name="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300",
                ),
            ),
            class_name="p-8",
        )
    )


def create_group_page() -> rx.Component:
    return layout(
        rx.el.div(
            create_group_form(),
            class_name="p-8 flex items-center justify-center min-h-[80vh]",
        )
    )


def join_group_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h2(
                    "Join a Study Group",
                    class_name="text-2xl font-bold text-gray-900 mb-6",
                ),
                rx.el.div(
                    rx.el.div(
                        rx.el.label(
                            "Group Code",
                            class_name="block text-sm font-medium text-gray-700 mb-1",
                        ),
                        rx.el.input(
                            placeholder="e.g. AB12CD",
                            on_change=MicroGroupState.set_join_group_code,
                            class_name="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono uppercase mb-6",
                            max_length=6,
                            default_value=MicroGroupState.join_group_code,
                        ),
                    ),
                    rx.el.button(
                        "Join Group",
                        on_click=MicroGroupState.join_group,
                        class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md",
                    ),
                    class_name="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto",
                ),
            ),
            class_name="p-8 flex items-center justify-center min-h-[80vh]",
        )
    )


def group_dashboard_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.cond(
                MicroGroupState.current_group,
                rx.el.div(
                    rx.el.div(
                        rx.el.h1(
                            MicroGroupState.current_group.name,
                            class_name="text-2xl font-bold text-gray-900 mr-4",
                        ),
                        rx.el.p(
                            MicroGroupState.current_group.description,
                            class_name="text-gray-500",
                        ),
                        class_name="mb-6 border-b border-gray-200 pb-4",
                    ),
                    rx.el.div(
                        rx.el.div(
                            invite_section(),
                            class_name="col-span-1 md:col-span-2 lg:col-span-1",
                        ),
                        rx.el.div(
                            member_list(),
                            class_name="col-span-1 md:col-span-2 lg:col-span-1",
                        ),
                        rx.el.div(
                            group_stats(),
                            class_name="col-span-1 md:col-span-2 lg:col-span-1",
                        ),
                        class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                    ),
                ),
                rx.el.div(
                    rx.spinner(size="3"),
                    rx.el.p("Loading group data...", class_name="mt-4 text-gray-500"),
                    class_name="flex flex-col items-center justify-center h-[60vh]",
                ),
            ),
            class_name="p-8",
        )
    )