import reflex as rx
from app.states.class_state import ClassState


def class_card(class_obj: dict) -> rx.Component:
    return rx.el.a(
        rx.el.div(
            rx.el.div(
                rx.el.h3(
                    class_obj.class_name, class_name="text-lg font-bold text-gray-900"
                ),
                rx.el.span(
                    class_obj.class_code,
                    class_name="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md",
                ),
                class_name="flex justify-between items-start mb-2",
            ),
            rx.el.p(class_obj.school, class_name="text-sm text-gray-500 mb-1"),
            rx.el.div(
                rx.icon("user", class_name="w-4 h-4 text-gray-400 mr-2"),
                rx.el.span(class_obj.professor, class_name="text-sm text-gray-600"),
                class_name="flex items-center mb-4",
            ),
            rx.el.div(
                rx.el.span(
                    f"{class_obj.term}", class_name="text-xs text-gray-500 font-medium"
                ),
                rx.el.span(
                    "View Class →",
                    class_name="text-sm font-semibold text-indigo-600 hover:text-indigo-800",
                ),
                class_name="flex justify-between items-center mt-auto pt-4 border-t border-gray-100",
            ),
            class_name="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col",
        ),
        href=f"/classes/{class_obj.id}",
        class_name="block",
    )


def create_class_form() -> rx.Component:
    return rx.el.div(
        rx.el.h2(
            "Create a New Class", class_name="text-2xl font-bold text-gray-900 mb-6"
        ),
        rx.el.div(
            rx.el.div(
                rx.el.label(
                    "Class Name",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.input(
                    placeholder="e.g. Intro to Computer Science",
                    on_change=ClassState.set_new_class_name,
                    class_name="w-full px-4 py-2 border border-gray-300 rounded-lg",
                    default_value=ClassState.new_class_name,
                ),
                class_name="mb-4",
            ),
            rx.el.div(
                rx.el.label(
                    "School / University",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.input(
                    placeholder="e.g. Stanford University",
                    on_change=ClassState.set_new_class_school,
                    class_name="w-full px-4 py-2 border border-gray-300 rounded-lg",
                    default_value=ClassState.new_class_school,
                ),
                class_name="mb-4",
            ),
            rx.el.div(
                rx.el.div(
                    rx.el.label(
                        "Professor",
                        class_name="block text-sm font-medium text-gray-700 mb-1",
                    ),
                    rx.el.input(
                        placeholder="e.g. Dr. Smith",
                        on_change=ClassState.set_new_class_professor,
                        class_name="w-full px-4 py-2 border border-gray-300 rounded-lg",
                        default_value=ClassState.new_class_professor,
                    ),
                    class_name="flex-1",
                ),
                rx.el.div(
                    rx.el.label(
                        "Term",
                        class_name="block text-sm font-medium text-gray-700 mb-1",
                    ),
                    rx.el.input(
                        placeholder="e.g. Fall 2023",
                        on_change=ClassState.set_new_class_term,
                        class_name="w-full px-4 py-2 border border-gray-300 rounded-lg",
                        default_value=ClassState.new_class_term,
                    ),
                    class_name="w-40",
                ),
                class_name="flex gap-4 mb-6",
            ),
            rx.el.button(
                "Create Class",
                on_click=ClassState.create_class,
                class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md",
            ),
            class_name="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto",
        ),
    )


def join_class_form() -> rx.Component:
    return rx.el.div(
        rx.el.h2("Join a Class", class_name="text-2xl font-bold text-gray-900 mb-6"),
        rx.el.div(
            rx.el.div(
                rx.el.label(
                    "Class Code",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.input(
                    placeholder="e.g. X8Y2Z9A1",
                    on_change=ClassState.set_join_class_code,
                    class_name="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono uppercase mb-6",
                    max_length=8,
                    default_value=ClassState.join_class_code,
                ),
            ),
            rx.el.button(
                "Join Class",
                on_click=ClassState.join_class,
                class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md",
            ),
            class_name="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto",
        ),
    )