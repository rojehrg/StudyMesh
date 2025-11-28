import reflex as rx
from app.components.class_ui import class_card, create_class_form, join_class_form
from app.components.sidebar import layout
from app.components.graph_ui import class_graph_component, student_detail_modal
from app.states.class_state import ClassState
from app.states.micro_group_state import MicroGroupState
from app.states.auth_state import AuthState


def classes_list_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h1("My Classes", class_name="text-2xl font-bold text-gray-900"),
                rx.el.div(
                    rx.el.a(
                        "+ Create Class",
                        href="/classes/create",
                        class_name="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors",
                    ),
                    rx.el.a(
                        "Join Class",
                        href="/classes/join",
                        class_name="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm",
                    ),
                    class_name="flex gap-3",
                ),
                class_name="flex justify-between items-center mb-8",
            ),
            rx.cond(
                ClassState.user_classes,
                rx.el.div(
                    rx.foreach(ClassState.user_classes, class_card),
                    class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                ),
                rx.el.div(
                    rx.icon("book-open", class_name="w-16 h-16 text-gray-300 mb-4"),
                    rx.el.h3(
                        "No classes yet",
                        class_name="text-lg font-medium text-gray-900 mb-2",
                    ),
                    rx.el.p(
                        "Join a class or create one to get started.",
                        class_name="text-gray-500 mb-6",
                    ),
                    class_name="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300",
                ),
            ),
            class_name="p-8",
        )
    )


def create_class_page() -> rx.Component:
    return layout(
        rx.el.div(
            create_class_form(),
            class_name="p-8 flex items-center justify-center min-h-[80vh]",
        )
    )


def join_class_page() -> rx.Component:
    return layout(
        rx.el.div(
            join_class_form(),
            class_name="p-8 flex items-center justify-center min-h-[80vh]",
        )
    )


def class_dashboard_page() -> rx.Component:
    return layout(
        rx.el.div(
            student_detail_modal(),
            rx.cond(
                ClassState.current_class,
                rx.el.div(
                    rx.el.div(
                        rx.el.div(
                            rx.el.h1(
                                ClassState.current_class.class_name,
                                class_name="text-2xl font-bold text-gray-900 mr-4",
                            ),
                            rx.el.span(
                                ClassState.current_class.class_code,
                                class_name="font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold",
                            ),
                            class_name="flex items-center mb-2",
                        ),
                        rx.el.div(
                            rx.el.span(
                                f"Prof. {ClassState.current_class.professor} • {ClassState.current_class.school}",
                                class_name="text-gray-500 text-sm",
                            ),
                            rx.el.button(
                                rx.cond(
                                    ClassState.is_calculating_matches,
                                    rx.el.span(
                                        "Calculating...", class_name="animate-pulse"
                                    ),
                                    "↻ Refresh Data",
                                ),
                                on_click=ClassState.calculate_class_matches,
                                disabled=ClassState.is_calculating_matches,
                                class_name="ml-auto text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm",
                            ),
                            class_name="flex items-center w-full",
                        ),
                        class_name="mb-6 border-b border-gray-200 pb-4",
                    ),
                    rx.cond(
                        ClassState.current_class.created_by == AuthState.user_id,
                        rx.el.div(
                            rx.el.button(
                                "Delete Class",
                                on_click=ClassState.delete_class,
                                class_name="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg border border-transparent hover:border-red-200 transition-colors",
                            ),
                            class_name="flex justify-end mb-4",
                        ),
                    ),
                    rx.el.div(
                        rx.el.div(
                            rx.el.div(
                                class_graph_component(),
                                class_name="w-full h-[600px] relative",
                            ),
                            rx.el.div(
                                rx.el.h3(
                                    "Recommended Micro Groups",
                                    class_name="font-bold text-gray-800 mb-3 mt-6",
                                ),
                                rx.cond(
                                    ClassState.micro_group_suggestions,
                                    rx.el.div(
                                        rx.foreach(
                                            ClassState.micro_group_suggestions,
                                            lambda group: rx.el.div(
                                                rx.el.div(
                                                    rx.el.span(
                                                        group.name,
                                                        class_name="font-semibold text-indigo-900",
                                                    ),
                                                    rx.el.span(
                                                        f"Avg Match: {group.avg_score}%",
                                                        class_name="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full",
                                                    ),
                                                    class_name="flex justify-between items-center mb-2",
                                                ),
                                                rx.el.div(
                                                    rx.foreach(
                                                        group.members,
                                                        lambda m: rx.el.span(
                                                            m,
                                                            class_name="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 mr-1",
                                                        ),
                                                    ),
                                                    class_name="flex flex-wrap gap-1 mb-2",
                                                ),
                                                rx.el.p(
                                                    group.reason,
                                                    class_name="text-xs text-gray-400 italic",
                                                ),
                                                rx.el.button(
                                                    "Create Group",
                                                    class_name="mt-3 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium w-full",
                                                    on_click=lambda: MicroGroupState.prepare_creation(
                                                        ClassState.current_class.id
                                                    ),
                                                ),
                                                class_name="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all",
                                            ),
                                        ),
                                        class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                                    ),
                                    rx.el.p(
                                        "Run matching to see group suggestions.",
                                        class_name="text-gray-500 text-sm italic",
                                    ),
                                ),
                            ),
                            class_name="col-span-1 lg:col-span-3 flex flex-col gap-6",
                        ),
                        rx.el.div(
                            rx.el.div(
                                rx.el.h3(
                                    "Top Matches",
                                    class_name="font-bold text-gray-800 mb-3",
                                ),
                                rx.el.div(
                                    rx.foreach(
                                        ClassState.recommended_partners,
                                        lambda match: rx.el.div(
                                            rx.el.div(
                                                rx.el.p(
                                                    match.partner_name,
                                                    class_name="font-semibold text-gray-900 text-sm",
                                                ),
                                                rx.el.span(
                                                    f"{match.score}%",
                                                    class_name="text-xs font-bold text-indigo-600",
                                                ),
                                                class_name="flex justify-between items-center mb-1",
                                            ),
                                            rx.el.div(
                                                rx.el.div(
                                                    class_name="h-full bg-indigo-500",
                                                    style={"width": f"{match.score}%"},
                                                ),
                                                class_name="h-1 rounded-full bg-indigo-100 overflow-hidden",
                                            ),
                                            class_name="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-2 cursor-pointer hover:border-indigo-300 transition-colors",
                                            on_click=lambda: ClassState.select_student(
                                                match.partner_id.to_string()
                                            ),
                                        ),
                                    ),
                                    class_name="max-h-[300px] overflow-y-auto pr-2 mb-6",
                                ),
                                rx.cond(
                                    ~ClassState.recommended_partners,
                                    rx.el.div(
                                        rx.el.p(
                                            "No matches calculated yet.",
                                            class_name="text-sm text-gray-500 italic mb-4",
                                        ),
                                        class_name="bg-gray-50 p-4 rounded-lg text-center border border-gray-200 mb-6",
                                    ),
                                ),
                                rx.el.h3(
                                    "Classmates",
                                    class_name="font-bold text-gray-800 mb-3",
                                ),
                                rx.el.div(
                                    rx.foreach(
                                        ClassState.current_class_members,
                                        lambda member: rx.el.div(
                                            rx.el.div(
                                                rx.el.span(
                                                    member.name,
                                                    class_name="font-medium text-gray-700 text-sm",
                                                ),
                                                rx.cond(
                                                    member.profile_complete,
                                                    rx.el.div(
                                                        class_name="w-2 h-2 rounded-full bg-green-400"
                                                    ),
                                                    rx.el.div(
                                                        class_name="w-2 h-2 rounded-full bg-gray-300"
                                                    ),
                                                ),
                                                class_name="flex items-center justify-between",
                                            ),
                                            class_name="py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors cursor-pointer",
                                            on_click=lambda: ClassState.select_student(
                                                member.id.to_string()
                                            ),
                                        ),
                                    ),
                                    class_name="max-h-[300px] overflow-y-auto pr-2",
                                ),
                                class_name="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-full",
                            ),
                            class_name="col-span-1 lg:col-span-1 h-full",
                        ),
                        class_name="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full",
                    ),
                ),
                rx.el.div(
                    rx.spinner(size="3"),
                    rx.el.p("Loading class data...", class_name="mt-4 text-gray-500"),
                    class_name="flex flex-col items-center justify-center h-[60vh]",
                ),
            ),
            class_name="p-6 max-w-[1600px] mx-auto h-[calc(100vh-2rem)] flex flex-col",
        )
    )