import reflex as rx
from app.components.class_ui import class_card, create_class_form, join_class_form
from app.components.sidebar import layout
from app.components.graph_ui import class_graph_component, student_detail_modal
from app.components.support_offer_ui import support_offer_modal
from app.states.class_state import ClassState
from app.states.micro_group_state import MicroGroupState
from app.states.auth_state import AuthState
from app.states.layout_state import LayoutState
from app.states.notification_state import NotificationState


def classes_list_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h1("My Enablement Pods", class_name="text-2xl font-bold text-gray-900"),
                rx.el.div(
                    rx.el.a(
                        "+ Create Pod",
                        href="/classes/create",
                        class_name="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors",
                    ),
                    rx.el.a(
                        "Join Pod",
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
                    rx.icon("users", class_name="w-16 h-16 text-gray-300 mb-4"),
                    rx.el.h3(
                        "No pods yet",
                        class_name="text-lg font-medium text-gray-900 mb-2",
                    ),
                    rx.el.p(
                        "Spin up a pod or join one with a share code to get started.",
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


def notification_item(notification) -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.icon("bell", class_name="w-4 h-4 text-indigo-600 mt-1"),
            class_name="flex-shrink-0",
        ),
        rx.el.div(
            rx.el.p(notification.content, class_name="text-sm text-gray-900"),
            rx.el.p(notification.created_at, class_name="text-xs text-gray-500 mt-1"),
            class_name="flex-1 ml-3",
        ),
        rx.cond(
            ~notification.read,
            rx.el.div(class_name="w-2 h-2 bg-indigo-600 rounded-full"),
        ),
        class_name="flex items-start p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors",
    )


def class_dashboard_page() -> rx.Component:
    """Redesigned pod dashboard with Command Center layout."""
    return layout(
        rx.el.div(
            student_detail_modal(),
            support_offer_modal(),
            rx.cond(
                ClassState.current_class,
                rx.el.div(
                    # Top Bar
                    rx.el.div(
                        rx.el.div(
                            rx.el.h1(
                                ClassState.current_class.class_name,
                                class_name="text-2xl font-bold text-gray-900",
                            ),
                            rx.el.div(
                                rx.el.span(
                                    ClassState.current_class.class_code,
                                    class_name="font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold border border-indigo-100",
                                ),
                                rx.el.span(
                                    f"• {ClassState.current_class.school}",
                                    class_name="text-gray-500 text-sm",
                                ),
                                class_name="flex items-center gap-2 mt-1",
                            ),
                            class_name="flex-1",
                        ),
                        rx.el.div(
                            rx.el.button(
                                rx.icon("refresh-cw", class_name="w-4 h-4"),
                                on_click=ClassState.calculate_class_matches,
                                disabled=ClassState.is_calculating_matches,
                                class_name="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors",
                                title="Refresh Data",
                            ),
                            rx.cond(
                                ClassState.current_class.created_by == AuthState.user_id,
                                rx.el.div(
                                    rx.el.button(
                                        rx.icon("trash-2", class_name="w-4 h-4"),
                                        on_click=ClassState.delete_class,
                                        class_name="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2",
                                        title="Archive Pod",
                                    ),
                                    class_name="flex items-center",
                                ),
                            ),
                            class_name="flex items-center",
                        ),
                        class_name="flex items-start justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6",
                    ),
                    
                    # Main Content Grid
                    rx.el.div(
                        # Left: Network Graph
                        rx.el.div(
                            rx.el.div(
                                rx.el.h2("Network Topology", class_name="font-semibold text-gray-900"),
                                rx.el.div(
                                    rx.el.span("Interactive", class_name="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"),
                                    class_name="ml-auto",
                                ),
                                class_name="flex items-center p-4 border-b border-gray-100",
                            ),
                            rx.el.div(
                                class_graph_component(),
                                class_name="h-[600px] w-full bg-gray-50 relative",
                            ),
                            class_name="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full",
                        ),
                        
                        # Right: Enablement Hub (Tabs)
                        rx.el.div(
                            rx.tabs.root(
                                rx.tabs.list(
                                    rx.tabs.trigger("Insights", value="insights", class_name="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all"),
                                    rx.tabs.trigger("Team", value="team", class_name="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all"),
                                    rx.tabs.trigger("Activity", value="activity", class_name="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all"),
                                    class_name="flex border-b border-gray-200 bg-white rounded-t-xl px-2",
                                ),
                                
                                # Insights Tab
                                rx.tabs.content(
                                    rx.el.div(
                                        rx.cond(
                                            ClassState.recommended_partners,
                                            rx.el.div(
                                                rx.foreach(
                                                    ClassState.recommended_partners,
                                                    lambda match: rx.el.div(
                                                        rx.el.div(
                                                            rx.el.div(
                                                                rx.el.div(
                                                                    match.partner_name[0],
                                                                    class_name="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm",
                                                                ),
                                                                rx.el.div(
                                                                    rx.el.p(match.partner_name, class_name="font-semibold text-gray-900 text-sm"),
                                                                    rx.el.p(f"{match.score}% Compatible", class_name="text-xs text-indigo-600 font-medium"),
                                                                    class_name="ml-3",
                                                                ),
                                                                class_name="flex items-center",
                                                            ),
                                                            rx.el.button(
                                                                rx.icon("hand", class_name="w-4 h-4"),
                                                                on_click=lambda: ClassState.nudge_partner(match.partner_id),
                                                                class_name="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors",
                                                                title="Nudge to connect",
                                                            ),
                                                            class_name="flex justify-between items-start mb-3",
                                                        ),
                                                        # Match Reasons
                                                        rx.cond(
                                                            match.match_reasons,
                                                            rx.el.div(
                                                                rx.foreach(
                                                                    match.match_reasons,
                                                                    lambda reason: rx.cond(
                                                                        reason.contains("Offer"),
                                                                        rx.el.span(
                                                                            reason,
                                                                            class_name="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 font-medium"
                                                                        ),
                                                                        rx.cond(
                                                                            reason.contains("Ask"),
                                                                            rx.el.span(
                                                                                reason,
                                                                                class_name="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 font-medium"
                                                                            ),
                                                                            rx.el.span(
                                                                                reason,
                                                                                class_name="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200 font-medium"
                                                                            )
                                                                        )
                                                                    )
                                                                ),
                                                                class_name="flex gap-2 flex-wrap mb-2"
                                                            )
                                                        ),
                                                        rx.el.div(
                                                            rx.el.span(f"Gap Score: {match.breakdown.skill_gap}", class_name="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full"),
                                                            rx.el.span(f"Reliability: {match.breakdown.reliability}", class_name="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full"),
                                                            class_name="flex gap-2 flex-wrap",
                                                        ),
                                                        class_name="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-200",
                                                    ),
                                                ),
                                                class_name="space-y-3",
                                            ),
                                            rx.el.div(
                                                rx.icon("sparkles", class_name="w-12 h-12 text-gray-300 mb-2"),
                                                rx.el.p("No insights yet", class_name="text-gray-500 font-medium"),
                                                class_name="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300",
                                            ),
                                        ),
                                        class_name="p-4 bg-gray-50/50 min-h-[600px]",
                                    ),
                                    value="insights",
                                    class_name="bg-white rounded-b-xl border border-t-0 border-gray-200",
                                ),
                                
                                # Team Tab
                                rx.tabs.content(
                                    rx.el.div(
                                        rx.cond(
                                            ClassState.current_class_members,
                                            rx.el.div(
                                                rx.foreach(
                                                    ClassState.current_class_members,
                                                    lambda member: rx.el.div(
                                                        rx.el.div(
                                                            rx.el.div(
                                                                rx.el.span(member.name[0], class_name="text-xs font-bold text-gray-600"),
                                                                class_name="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center",
                                                            ),
                                                            rx.el.div(
                                                                rx.el.span(member.name, class_name="ml-3 text-sm font-medium text-gray-900"),
                                                                on_click=lambda: ClassState.select_student(member.id.to_string()),
                                                                class_name="cursor-pointer hover:underline"
                                                            ),
                                                            class_name="flex items-center flex-1",
                                                        ),
                                                        rx.el.button(
                                                            rx.icon("hand", class_name="w-3 h-3"),
                                                            on_click=lambda: ClassState.nudge_user(member.id),
                                                            class_name="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2",
                                                            title="Nudge"
                                                        ),
                                                        class_name="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors",
                                                    ),
                                                ),
                                                class_name="divide-y divide-gray-100",
                                            ),
                                            rx.el.p("No members found.", class_name="text-gray-500 text-sm text-center p-4"),
                                        ),
                                        class_name="p-4 min-h-[600px]",
                                    ),
                                    value="team",
                                    class_name="bg-white rounded-b-xl border border-t-0 border-gray-200",
                                ),
                                
                                # Activity Tab
                                rx.tabs.content(
                                    rx.el.div(
                                        rx.cond(
                                            NotificationState.notifications,
                                            rx.el.div(
                                                rx.foreach(
                                                    NotificationState.notifications,
                                                    notification_item
                                                ),
                                                class_name="space-y-2",
                                            ),
                                            rx.el.div(
                                                rx.icon("bell-off", class_name="w-12 h-12 text-gray-300 mb-2"),
                                                rx.el.p("No recent activity", class_name="text-gray-500 font-medium"),
                                                class_name="flex flex-col items-center justify-center h-48",
                                            ),
                                        ),
                                        class_name="p-4 bg-gray-50/50 min-h-[600px]",
                                    ),
                                    value="activity",
                                    class_name="bg-white rounded-b-xl border border-t-0 border-gray-200",
                                ),
                                default_value="insights",
                                class_name="w-full h-full flex flex-col",
                            ),
                            class_name="h-full flex flex-col",
                        ),
                        class_name="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6",
                    ),
                    class_name="space-y-6",
                ),
                rx.el.div(
                    rx.spinner(size="3"),
                    rx.el.p("Loading pod data...", class_name="mt-4 text-gray-500"),
                    class_name="flex flex-col items-center justify-center h-[60vh]",
                ),
            ),
            class_name=rx.cond(
                LayoutState.sidebar_collapsed,
                "p-8 max-w-[1600px] mx-auto w-full",
                "p-8 max-w-[1800px] mx-auto",
            ),
        )
    )
