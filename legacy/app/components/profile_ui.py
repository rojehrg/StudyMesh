import reflex as rx
from app.states.profile_state import ProfileState
from app.states.auth_state import AuthState


def form_section(title: str, *children) -> rx.Component:
    return rx.el.div(
        rx.el.h3(title, class_name="text-lg font-semibold text-gray-900 mb-4"),
        rx.el.div(*children, class_name="space-y-4"),
        class_name="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6",
    )


def form_field(
    label: str, input_component: rx.Component, required: bool = False
) -> rx.Component:
    return rx.el.div(
        rx.el.label(
            label,
            rx.cond(required, rx.el.span("*", class_name="text-red-500 ml-1")),
            class_name="block text-sm font-medium text-gray-700 mb-1",
        ),
        input_component,
        class_name="w-full",
    )


def availability_grid() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div("", class_name="w-20"),
            rx.foreach(
                ProfileState.time_blocks,
                lambda time: rx.el.div(
                    time, class_name="text-xs font-medium text-gray-500 text-center"
                ),
            ),
            class_name="grid grid-cols-5 gap-2 mb-2",
        ),
        rx.foreach(
            ProfileState.days_of_week,
            lambda day: rx.el.div(
                rx.el.div(
                    day, class_name="text-xs font-medium text-gray-700 w-20 pt-1"
                ),
                rx.foreach(
                    ProfileState.time_blocks,
                    lambda time: rx.el.div(
                        rx.checkbox(
                            on_change=lambda checked: ProfileState.set_availability(
                                day, time, checked
                            ),
                            checked=ProfileState.availability[day].contains(time),
                        ),
                        class_name="flex justify-center",
                    ),
                ),
                class_name="grid grid-cols-5 gap-2 items-center py-2 border-b border-gray-50 last:border-0",
            ),
        ),
        class_name="w-full overflow-x-auto",
    )


def profile_form() -> rx.Component:
    return rx.el.div(
        rx.el.div(
            rx.el.div(
                rx.el.span(
                    "Enablement Profile",
                    class_name="text-sm font-medium text-gray-700",
                ),
                rx.el.span(
                    f"{ProfileState.completion_percentage}%",
                    class_name="text-sm font-bold text-indigo-600",
                ),
                class_name="flex justify-between mb-2",
            ),
            rx.el.div(
                rx.el.div(
                    class_name="h-2 bg-indigo-600 rounded-full transition-all duration-500",
                    style={"width": f"{ProfileState.completion_percentage}%"},
                ),
                class_name="w-full h-2 bg-gray-200 rounded-full overflow-hidden",
            ),
            class_name="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6",
        ),
        form_section(
            "Enablement Focus",
            form_field(
                "Primary expertise area",
                rx.el.input(
                    placeholder="e.g. Product Enablement",
                    value=ProfileState.study_style,
                    on_change=ProfileState.set_study_style,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                ),
                required=True,
            ),
            form_field(
                "Where do you need support most?",
                rx.select(
                    ProfileState.study_time_options,
                    value=ProfileState.study_time_preference,
                    on_change=ProfileState.set_study_time_preference,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",
                ),
                required=True,
            ),
            form_field(
                "Preferred collaboration circle size",
                rx.select(
                    ProfileState.group_size_options,
                    value=ProfileState.preferred_group_size,
                    on_change=ProfileState.set_preferred_group_size,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",
                ),
                required=True,
            ),
        ),
        form_section(
            "Capabilities & Growth Goals",
            form_field(
                "Skills I can teach/mentor (Expertise)",
                rx.el.div(
                    rx.el.p(
                        "Type a skill and press Enter to add it.",
                        class_name="text-xs text-gray-500 mb-2",
                    ),
                    rx.el.div(
                        rx.foreach(
                            ProfileState.expertise_skills,
                            lambda skill: rx.el.span(
                                skill,
                                rx.icon(
                                    "x",
                                    size=14,
                                    class_name="ml-1 cursor-pointer hover:text-red-500",
                                    on_click=lambda: ProfileState.remove_expertise_skill(skill)
                                ),
                                class_name="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2",
                            ),
                        ),
                        class_name="flex flex-wrap mb-2",
                    ),
                    rx.el.input(
                        placeholder="Add a skill...",
                        value=ProfileState.expertise_input,
                        on_change=ProfileState.set_expertise_input,
                        on_key_down=lambda e: rx.cond(
                            e == "Enter",
                            ProfileState.add_expertise_skill,
                            rx.console_log("typing...")
                        ),
                        class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                    ),
                    rx.el.button(
                        "Add",
                        on_click=ProfileState.add_expertise_skill,
                        class_name="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium",
                        type="button" # Prevent form submission
                    ),
                    class_name="space-y-2",
                ),
                required=True,
            ),
            form_field(
                "Skills I want to learn (Growth Areas)",
                rx.el.div(
                    rx.el.p(
                        "Type a skill and press Enter to add it.",
                        class_name="text-xs text-gray-500 mb-2",
                    ),
                    rx.el.div(
                        rx.foreach(
                            ProfileState.growth_skills,
                            lambda skill: rx.el.span(
                                skill,
                                rx.icon(
                                    "x",
                                    size=14,
                                    class_name="ml-1 cursor-pointer hover:text-red-500",
                                    on_click=lambda: ProfileState.remove_growth_skill(skill)
                                ),
                                class_name="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2",
                            ),
                        ),
                        class_name="flex flex-wrap mb-2",
                    ),
                    rx.el.input(
                        placeholder="Add a skill...",
                        value=ProfileState.growth_input,
                        on_change=ProfileState.set_growth_input,
                        on_key_down=lambda e: rx.cond(
                            e == "Enter",
                            ProfileState.add_growth_skill,
                            rx.console_log("typing...")
                        ),
                        class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                    ),
                    rx.el.button(
                        "Add",
                        on_click=ProfileState.add_growth_skill,
                        class_name="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium",
                        type="button"
                    ),
                    class_name="space-y-2",
                ),
                required=True,
            ),
            form_field(
                "Engagement objective",
                rx.el.input(
                    on_change=ProfileState.set_academic_goal,
                    placeholder="e.g. Lead Q4 Product Launch, Master Advanced Analytics, Build Customer Success Playbooks",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    default_value=ProfileState.academic_goal,
                ),
                required=True,
            ),
        ),
        form_section(
            "Collaboration Logistics",
            form_field(
                "Department",
                rx.el.input(
                    on_change=ProfileState.set_department,
                    placeholder="e.g. Sales, Engineering, Customer Success",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    default_value=ProfileState.department,
                ),
            ),
            form_field(
                "Collaboration preference",
                rx.select(
                    ProfileState.collaboration_options,
                    value=ProfileState.collaboration_preference,
                    on_change=ProfileState.set_collaboration_preference,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",
                ),
                required=True,
            ),
            form_field(
                "Session format preference",
                rx.el.div(
                    rx.el.span("Remote", class_name="text-sm text-gray-600 mr-3"),
                    rx.switch(
                        checked=rx.cond(
                            ProfileState.location_preference == "In-person", True, False
                        ),
                        on_change=lambda val: ProfileState.set_location_preference(
                            rx.cond(val, "In-person", "Remote")
                        ),
                    ),
                    rx.el.span("In-person", class_name="text-sm text-gray-600 ml-3"),
                    class_name="flex items-center",
                ),
                required=True,
            ),
            form_field(
                "Primary timezone",
                rx.el.input(
                    on_change=ProfileState.set_timezone,
                    placeholder="e.g. US/Eastern",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    default_value=ProfileState.timezone,
                ),
            ),
            form_field("Meeting availability", availability_grid()),
        ),
        form_section(
            "Reliability & Collaboration",
            form_field(
                "Self-Rated Reliability",
                rx.el.div(
                    rx.el.p(
                        "How reliable are you at following through on commitments? This helps us match you with the right opportunities.",
                        class_name="text-sm text-gray-600 mb-4",
                    ),
                    rx.el.div(
                        rx.el.div(
                            rx.el.span(
                                "1",
                                class_name="text-xs text-gray-500",
                            ),
                            rx.el.span(
                                "5",
                                class_name="text-xs text-gray-500",
                            ),
                            class_name="flex justify-between mb-2",
                        ),
                        rx.el.input(
                            type="range",
                            min="1",
                            max="5",
                            step="1",
                            on_change=ProfileState.set_reliability,
                            value=ProfileState.reliability,
                            class_name="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600",
                        ),
                        rx.el.div(
                            rx.el.span(
                                "Low",
                                class_name="text-xs text-gray-500",
                            ),
                            rx.el.span(
                                "High",
                                class_name="text-xs text-gray-500",
                            ),
                            class_name="flex justify-between mt-1",
                        ),
                        rx.cond(
                            ProfileState.reliability > 0,
                            rx.el.div(
                                rx.el.p(
                                    f"Current rating: {ProfileState.reliability}/5",
                                    class_name="text-sm font-medium text-indigo-600 mt-3",
                                ),
                                class_name="text-center",
                            ),
                        ),
                        class_name="w-full",
                    ),
                ),
            ),
        ),
        form_section(
            "About Your Work",
            form_field(
                "Current teams / projects",
                rx.el.input(
                    on_change=ProfileState.set_major,
                    placeholder="e.g. Revenue Acceleration Squad",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    default_value=ProfileState.major,
                ),
            ),
            form_field(
                "Current projects (comma-separated)",
                rx.el.input(
                    on_change=ProfileState.set_current_projects,
                    placeholder="e.g. Q3 Product Launch, Customer Onboarding Initiative",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    value=ProfileState.current_projects_str,
                ),
            ),
            form_field(
                "How teammates can partner with you",
                rx.el.textarea(
                    on_change=ProfileState.set_bio,
                    placeholder="Share your background, current initiatives, and the kind of help you can offer or need.",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",
                    default_value=ProfileState.bio,
                ),
            ),
        ),
        rx.el.div(
            rx.el.button(
                "Save Profile",
                on_click=ProfileState.save_profile,
                class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg",
            ),
            class_name="sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg",
        ),
        # Key forces re-mount when user changes, preventing stale data leakage
        key=f"profile_form_{AuthState.user_id}",
        class_name="max-w-2xl mx-auto w-full pb-12",
    )