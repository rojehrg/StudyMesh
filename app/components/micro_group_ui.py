import reflex as rx
from app.states.micro_group_state import MicroGroupState
from app.states.auth_state import AuthState
from urllib.parse import quote


def group_card(group: dict) -> rx.Component:
    return rx.el.a(
        rx.el.div(
            rx.el.div(
                rx.el.h3(group.name, class_name="text-lg font-bold text-gray-900"),
                rx.el.span(
                    "Active",
                    class_name="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded-md",
                ),
                class_name="flex justify-between items-start mb-2",
            ),
            rx.el.p(
                f"Code: {group.group_code}",
                class_name="text-sm font-mono text-gray-500 mb-4 bg-gray-50 p-1 rounded w-fit",
            ),
            rx.el.div(
                rx.el.span(
                    "View Dashboard →",
                    class_name="text-sm font-semibold text-indigo-600 hover:text-indigo-800",
                ),
                class_name="mt-auto pt-4 border-t border-gray-100",
            ),
            class_name="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col",
        ),
        href=f"/groups/{group.id}",
        class_name="block",
    )


def create_group_form() -> rx.Component:
    return rx.el.div(
        rx.el.h2(
            "Create Study Group", class_name="text-2xl font-bold text-gray-900 mb-6"
        ),
        rx.el.div(
            rx.el.div(
                rx.el.label(
                    "Group Name",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.input(
                    placeholder="e.g. Exam Cram Squad",
                    on_change=MicroGroupState.set_new_group_name,
                    class_name="w-full px-4 py-2 border border-gray-300 rounded-lg",
                    default_value=MicroGroupState.new_group_name,
                ),
                class_name="mb-4",
            ),
            rx.el.div(
                rx.el.label(
                    "Description (Optional)",
                    class_name="block text-sm font-medium text-gray-700 mb-1",
                ),
                rx.el.textarea(
                    placeholder="What is this group about?",
                    on_change=MicroGroupState.set_new_group_description,
                    class_name="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24",
                ),
                class_name="mb-4",
            ),
            rx.el.div(
                rx.el.label(
                    "Select Members (Max 4)",
                    class_name="block text-sm font-medium text-gray-700 mb-2",
                ),
                rx.el.div(
                    rx.cond(
                        MicroGroupState.available_classmates,
                        rx.foreach(
                            MicroGroupState.available_classmates,
                            lambda user: rx.el.div(
                                rx.checkbox(
                                    checked=MicroGroupState.selected_classmate_ids.contains(
                                        user.id
                                    ),
                                    on_change=lambda _: MicroGroupState.toggle_classmate_selection(
                                        user.id
                                    ),
                                ),
                                rx.el.span(user.name, class_name="ml-2 text-gray-700"),
                                class_name="flex items-center p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors",
                            ),
                        ),
                        rx.el.p(
                            "No other classmates found.",
                            class_name="text-gray-500 italic text-sm",
                        ),
                    ),
                    class_name="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50",
                ),
                class_name="mb-6",
            ),
            rx.el.button(
                "Create Group",
                on_click=MicroGroupState.create_group,
                class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md",
            ),
            class_name="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto",
        ),
    )


def invite_section() -> rx.Component:
    return rx.el.div(
        rx.el.h3("Invite Members", class_name="text-lg font-bold text-gray-900 mb-3"),
        rx.el.div(
            rx.el.div(
                rx.el.span(
                    "Group Code",
                    class_name="text-xs text-gray-500 uppercase font-semibold block mb-1",
                ),
                rx.el.div(
                    rx.el.span(
                        MicroGroupState.current_group.group_code,
                        class_name="text-2xl font-mono font-bold tracking-widest text-indigo-600",
                    ),
                    rx.el.button(
                        rx.icon(
                            "copy",
                            class_name="w-5 h-5 text-gray-400 hover:text-indigo-600",
                        ),
                        on_click=MicroGroupState.copy_group_code,
                        class_name="p-2 hover:bg-gray-100 rounded-lg transition-colors",
                    ),
                    class_name="flex justify-between items-center",
                ),
                class_name="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4",
            ),
            rx.el.div(
                rx.el.p(
                    "Generate Intro Message",
                    class_name="text-sm font-medium text-gray-700 mb-2",
                ),
                rx.el.div(
                    rx.foreach(
                        ["Casual", "Serious", "Exam Prep"],
                        lambda t: rx.el.button(
                            t,
                            on_click=lambda: MicroGroupState.update_intro_template(t),
                            class_name=rx.cond(
                                MicroGroupState.intro_message_template == t,
                                "px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium border border-indigo-200",
                                "px-3 py-1 text-xs rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50",
                            ),
                        ),
                    ),
                    class_name="flex gap-2 mb-3",
                ),
                rx.el.div(
                    rx.el.p(
                        MicroGroupState.generated_intro_message,
                        class_name="text-sm text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 mb-3",
                    ),
                    rx.el.div(
                        share_button(
                            "WhatsApp",
                            "message-circle",
                            "bg-[#25D366] hover:bg-[#20bd5a]",
                            f"https://wa.me/?text={MicroGroupState.generated_intro_message}",
                        ),
                        share_button(
                            "Email",
                            "mail",
                            "bg-gray-600 hover:bg-gray-700",
                            f"mailto:?subject=Join my Study Group&body={MicroGroupState.generated_intro_message}",
                        ),
                        class_name="flex gap-2",
                    ),
                ),
            ),
            class_name="bg-white p-5 rounded-xl border border-gray-200 shadow-sm",
        ),
    )


def share_button(label: str, icon: str, color_class: str, href: str) -> rx.Component:
    return rx.el.a(
        rx.icon(icon, class_name="w-4 h-4 mr-2"),
        label,
        href=href,
        target="_blank",
        class_name=f"{color_class} text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors flex-1 justify-center",
    )


def member_list() -> rx.Component:
    return rx.el.div(
        rx.el.h3("Members", class_name="text-lg font-bold text-gray-900 mb-3"),
        rx.el.div(
            rx.foreach(
                MicroGroupState.current_group_members,
                lambda member: rx.el.div(
                    rx.el.div(
                        rx.el.div(
                            rx.icon("user", class_name="w-5 h-5 text-gray-600"),
                            class_name="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3",
                        ),
                        rx.el.div(
                            rx.el.p(
                                member.name,
                                class_name="font-medium text-gray-900 text-sm",
                            ),
                            rx.el.p(member.email, class_name="text-xs text-gray-500"),
                        ),
                        class_name="flex items-center",
                    ),
                    rx.cond(
                        MicroGroupState.current_group.created_by == AuthState.user_id,
                        rx.cond(
                            member.id != AuthState.user_id,
                            rx.el.button(
                                rx.icon("trash-2", class_name="w-4 h-4"),
                                on_click=lambda: MicroGroupState.remove_member(
                                    member.id
                                ),
                                class_name="text-gray-400 hover:text-red-500 p-1 rounded transition-colors",
                            ),
                        ),
                    ),
                    class_name="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100",
                ),
            ),
            class_name="space-y-2",
        ),
        class_name="bg-gray-50 p-5 rounded-xl border border-gray-200",
    )


def group_stats() -> rx.Component:
    return rx.el.div(
        rx.el.h3("Group Stats", class_name="text-lg font-bold text-gray-900 mb-3"),
        rx.el.div(
            rx.el.div(
                rx.el.span(
                    "Avg Compatibility",
                    class_name="text-xs text-gray-500 uppercase font-semibold",
                ),
                rx.el.div(
                    rx.el.span(
                        f"{MicroGroupState.avg_compatibility}%",
                        class_name="text-2xl font-bold text-indigo-600",
                    ),
                    rx.el.div(
                        rx.el.div(
                            class_name="h-full bg-indigo-500",
                            style={"width": f"{MicroGroupState.avg_compatibility}%"},
                        ),
                        class_name="h-2 w-full bg-gray-100 rounded-full mt-1 overflow-hidden",
                    ),
                ),
                class_name="bg-white p-4 rounded-xl border border-gray-100 mb-3",
            ),
            rx.el.div(
                rx.el.span(
                    "Common Strengths",
                    class_name="text-xs text-gray-500 uppercase font-semibold block mb-2",
                ),
                rx.cond(
                    MicroGroupState.common_strengths,
                    rx.el.div(
                        rx.foreach(
                            MicroGroupState.common_strengths,
                            lambda s: rx.el.span(
                                s,
                                class_name="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 mr-1 mb-1 inline-block",
                            ),
                        )
                    ),
                    rx.el.span(
                        "No clear common strengths yet",
                        class_name="text-sm text-gray-400 italic",
                    ),
                ),
                class_name="bg-white p-4 rounded-xl border border-gray-100 mb-3",
            ),
            rx.el.div(
                rx.el.span(
                    "Shared Availability",
                    class_name="text-xs text-gray-500 uppercase font-semibold block mb-2",
                ),
                rx.cond(
                    MicroGroupState.common_availability,
                    rx.el.div(
                        rx.foreach(
                            MicroGroupState.common_availability,
                            lambda d: rx.el.span(
                                d,
                                class_name="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 mr-1 mb-1 inline-block",
                            ),
                        )
                    ),
                    rx.el.span(
                        "No common days found",
                        class_name="text-sm text-gray-400 italic",
                    ),
                ),
                class_name="bg-white p-4 rounded-xl border border-gray-100",
            ),
            class_name="bg-gray-50 p-5 rounded-xl border border-gray-200",
        ),
    )