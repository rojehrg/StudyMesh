import reflex as rx
import reflex_enterprise as rxe
from app.states.class_state import ClassState


@rx.memo
def student_node(data: rx.Var[dict], is_connectable: rx.Var[bool]):
    return rx.el.div(
        rxe.flow.handle(
            type="target",
            position="top",
            is_connectable=is_connectable,
            class_name="opacity-0",
        ),
        rxe.flow.handle(
            type="source",
            position="bottom",
            is_connectable=is_connectable,
            class_name="opacity-0",
        ),
        rx.el.div(
            rx.icon("user", class_name="w-5 h-5 text-gray-700"),
            class_name="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-md border-2 border-white ring-1 ring-gray-100",
            background_color=data["color"],
        ),
        rx.el.span(
            data["label"],
            class_name="text-[10px] font-bold text-gray-700 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap max-w-[120px] truncate text-center",
        ),
        class_name="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform",
    )


def class_graph_component() -> rx.Component:
    return rx.box(
        rxe.flow(
            rxe.flow.background(pattern_color="#e0e7ff", gap=20),
            rxe.flow.controls(show_interactive=False),
            nodes=ClassState.graph_nodes,
            edges=ClassState.graph_edges,
            node_types={"studentNode": student_node},
            on_node_click=lambda e, node: ClassState.select_student(node["id"]),
            fit_view=True,
            min_zoom=0.5,
            max_zoom=2.0,
            color_mode="light",
            attribution_position="bottom-left",
        ),
        class_name="w-full h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner",
    )


def student_detail_modal() -> rx.Component:
    return rx.radix.primitives.dialog.root(
        rx.radix.primitives.dialog.portal(
            rx.radix.primitives.dialog.overlay(
                class_name="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            ),
            rx.radix.primitives.dialog.content(
                rx.el.div(
                    rx.radix.primitives.dialog.title(
                        ClassState.selected_student_details["name"],
                        class_name="text-xl font-bold text-gray-900",
                    ),
                    rx.radix.primitives.dialog.close(
                        rx.el.button(
                            rx.icon("x", class_name="w-5 h-5"),
                            class_name="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100",
                        )
                    ),
                    class_name="flex justify-between items-start mb-4 border-b pb-2",
                ),
                rx.el.div(
                    rx.el.div(
                        rx.el.span(
                            "Expertise area",
                            class_name="text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        ),
                        rx.el.p(
                            ClassState.selected_student_details["study_style"],
                            class_name="text-sm font-medium text-gray-900",
                        ),
                        class_name="mb-3",
                    ),
                    rx.el.div(
                        rx.el.span(
                            "Engagement objective",
                            class_name="text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        ),
                        rx.el.p(
                            ClassState.selected_student_details["goals"],
                            class_name="text-sm font-medium text-gray-900",
                        ),
                        class_name="mb-3",
                    ),
                    rx.el.div(
                        rx.el.span(
                            "Capabilities",
                            class_name="text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        ),
                        rx.el.p(
                            ClassState.selected_student_details["strengths"],
                            class_name="text-sm text-gray-700",
                        ),
                        class_name="mb-3",
                    ),
                    rx.el.div(
                        rx.el.span(
                            "Background",
                            class_name="text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        ),
                        rx.el.p(
                            ClassState.selected_student_details["bio"],
                            class_name="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg",
                        ),
                    ),
                    class_name="space-y-2",
                ),
                rx.el.div(
                    rx.radix.primitives.dialog.close(
                        rx.el.button(
                            "Close",
                            class_name="w-full mt-6 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors",
                        )
                    )
                ),
                class_name="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-50",
            ),
        ),
        open=ClassState.show_student_modal,
        on_open_change=ClassState.set_show_student_modal,
    )