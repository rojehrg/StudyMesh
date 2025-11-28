import reflex as rx
from app.states.profile_state import ProfileState


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
                    "Profile Completeness",
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
            "Study Preferences",
            form_field(
                "What is your primary study style?",
                rx.select(
                    ProfileState.study_style_options,
                    value=ProfileState.study_style,
                    on_change=ProfileState.set_study_style,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white",
                ),
                required=True,
            ),
            form_field(
                "When do you prefer to study?",
                rx.select(
                    ProfileState.study_time_options,
                    value=ProfileState.study_time_preference,
                    on_change=ProfileState.set_study_time_preference,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white",
                ),
                required=True,
            ),
            form_field(
                "Preferred Group Size",
                rx.select(
                    ProfileState.group_size_options,
                    value=ProfileState.preferred_group_size,
                    on_change=ProfileState.set_preferred_group_size,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white",
                ),
                required=True,
            ),
        ),
        form_section(
            "Strengths & Goals",
            form_field(
                "Select your top strengths (Multiple)",
                rx.el.div(
                    rx.foreach(
                        ProfileState.strength_options,
                        lambda option: rx.el.label(
                            rx.checkbox(
                                checked=ProfileState.strengths.contains(option),
                                on_change=lambda val: ProfileState.toggle_strength(
                                    option
                                ),
                            ),
                            rx.el.span(option, class_name="ml-2 text-gray-700"),
                            class_name="flex items-center cursor-pointer",
                        ),
                    ),
                    class_name="space-y-2",
                ),
                required=True,
            ),
            form_field(
                "Academic Goal",
                rx.select(
                    ProfileState.academic_goal_options,
                    value=ProfileState.academic_goal,
                    on_change=ProfileState.set_academic_goal,
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white",
                ),
                required=True,
            ),
            form_field(
                "Self-Rated Reliability (1-5)",
                rx.el.div(
                    rx.el.input(
                        type="range",
                        min="1",
                        max="5",
                        step="1",
                        key=ProfileState.reliability.to_string(),
                        default_value=ProfileState.reliability.to_string(),
                        on_change=ProfileState.set_reliability_value.throttle(100),
                        class_name="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600",
                    ),
                    rx.el.div(
                        rx.el.span("1 (Casual)"),
                        rx.el.span(
                            f"Selected: {ProfileState.reliability}",
                            class_name="font-bold text-indigo-600",
                        ),
                        rx.el.span("5 (Serious)"),
                        class_name="flex justify-between text-xs text-gray-500 mt-2",
                    ),
                ),
                required=True,
            ),
        ),
        form_section(
            "Logistics",
            form_field(
                "Location Preference",
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
                "Timezone (Optional)",
                rx.el.input(
                    on_change=ProfileState.set_timezone,
                    placeholder="e.g. EST, UTC, PST",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg",
                    default_value=ProfileState.timezone,
                ),
            ),
            form_field("Weekly Availability", availability_grid()),
        ),
        form_section(
            "About You",
            form_field(
                "Major (Optional)",
                rx.el.input(
                    on_change=ProfileState.set_major,
                    placeholder="e.g. Computer Science",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg",
                    default_value=ProfileState.major,
                ),
            ),
            form_field(
                "Bio (Optional)",
                rx.el.textarea(
                    on_change=ProfileState.set_bio,
                    placeholder="Tell potential study partners a bit about yourself...",
                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none",
                    default_value=ProfileState.bio,
                ),
            ),
        ),
        rx.el.div(
            rx.el.button(
                "Save Profile",
                on_click=ProfileState.save_profile,
                class_name="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md",
            ),
            class_name="sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg",
        ),
        class_name="max-w-2xl mx-auto w-full pb-12",
    )