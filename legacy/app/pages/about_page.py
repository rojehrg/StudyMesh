"""
About Meshflow Page - Clean, informative design with improved flow
"""

import reflex as rx
from app.components.sidebar import layout


def feature_card(icon: str, title: str, description: str, color_class: str = "text-indigo-600", bg_class: str = "bg-indigo-50") -> rx.Component:
    """Create a feature highlight card."""
    return rx.el.div(
        rx.el.div(
            rx.icon(icon, class_name=f"w-6 h-6 {color_class}"),
            class_name=f"w-12 h-12 {bg_class} rounded-xl flex items-center justify-center mb-4",
        ),
        rx.el.h3(title, class_name="text-lg font-bold text-gray-900 mb-2"),
        rx.el.p(description, class_name="text-gray-600 text-sm leading-relaxed"),
        class_name="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300",
    )


def step_card(number: str, title: str, description: str) -> rx.Component:
    """Create a step in the 'How it works' flow."""
    return rx.el.div(
        rx.el.div(
            rx.el.span(number, class_name="text-sm font-bold text-indigo-600"),
            class_name="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4",
        ),
        rx.el.h3(title, class_name="text-lg font-bold text-gray-900 mb-2"),
        rx.el.p(description, class_name="text-gray-600 text-sm leading-relaxed"),
        class_name="relative z-10",
    )


def about_page() -> rx.Component:
    """About Meshflow page with improved design."""
    return layout(
        rx.el.div(
            # Hero Section
            rx.el.div(
                rx.el.div(
                    rx.el.span(
                        "KNOWLEDGE IN MOTION",
                        class_name="text-xs font-bold tracking-wider text-indigo-600 mb-4 block",
                    ),
                    rx.el.h1(
                        "Enablement that actually flows",
                        class_name="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight",
                    ),
                    rx.el.p(
                        "Meshflow pairs employees who have specific expertise with teammates who need it, automatically organizing them into focused, high-impact working circles.",
                        class_name="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed",
                    ),
                    class_name="max-w-4xl",
                ),
                class_name="bg-white border-b border-gray-100 px-6 py-16 md:py-24",
            ),
            
            # The Problem & Solution Grid
            rx.el.div(
                rx.el.div(
                    rx.el.h2("Why Meshflow?", class_name="text-2xl font-bold text-gray-900 mb-8"),
                    rx.el.div(
                        feature_card(
                            "zap",
                            "Close Gaps Faster",
                            "Stop waiting for formal training cycles. Connect directly with peers who have the answers you need right now.",
                            "text-amber-600",
                            "bg-amber-50"
                        ),
                        feature_card(
                            "users",
                            "Break Silos",
                            "Our algorithm connects people across departments and seniority levels based on shared goals and complementary skills.",
                            "text-blue-600",
                            "bg-blue-50"
                        ),
                        feature_card(
                            "target",
                            "Outcome Driven",
                            "Every connection is tied to a specific business outcome or KPI, ensuring learning translates to results.",
                            "text-green-600",
                            "bg-green-50"
                        ),
                        class_name="grid grid-cols-1 md:grid-cols-3 gap-6",
                    ),
                    class_name="max-w-7xl mx-auto px-6 py-16",
                ),
                class_name="bg-gray-50/50",
            ),

            # How it Works Flow
            rx.el.div(
                rx.el.div(
                    rx.el.h2("How it Works", class_name="text-2xl font-bold text-gray-900 mb-12 text-center"),
                    rx.el.div(
                        # Connection Line (Desktop)
                        rx.el.div(
                            class_name="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-indigo-100 -z-0",
                        ),
                        rx.el.div(
                            step_card(
                                "1",
                                "Create Profile",
                                "Share your expertise, growth goals, and availability. Be honest about your reliability score."
                            ),
                            step_card(
                                "2",
                                "Join a Pod",
                                "Enter a pod code to join a group focused on a specific business outcome (e.g., 'Q4 Product Launch')."
                            ),
                            step_card(
                                "3",
                                "Get Matched",
                                "Our algorithm analyzes compatibility scores (skills, goals, logistics) to find your perfect working circle."
                            ),
                            step_card(
                                "4",
                                "Collaborate",
                                "Meet with your circle (sync or async) to exchange knowledge and drive the pod's outcome forward."
                            ),
                            class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative",
                        ),
                        class_name="relative max-w-6xl mx-auto",
                    ),
                    class_name="max-w-7xl mx-auto px-6 py-16",
                ),
                class_name="bg-white border-y border-gray-100",
            ),
            
            # Algorithm Section (Simplified)
            rx.el.div(
                rx.el.div(
                    rx.el.div(
                        rx.el.h2(
                            "The Matching Engine",
                            class_name="text-2xl font-bold text-gray-900 mb-4",
                        ),
                        rx.el.p(
                            "We don't just match based on titles. We calculate a 100-point compatibility score for every potential pair.",
                            class_name="text-gray-600 mb-8 max-w-2xl",
                        ),
                        rx.el.div(
                            rx.el.div(
                                rx.el.span("30%", class_name="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block"),
                                rx.el.p("Skill Alignment", class_name="font-medium text-gray-900"),
                                class_name="p-4 bg-white rounded-lg border border-gray-200",
                            ),
                            rx.el.div(
                                rx.el.span("20%", class_name="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block"),
                                rx.el.p("Goal Similarity", class_name="font-medium text-gray-900"),
                                class_name="p-4 bg-white rounded-lg border border-gray-200",
                            ),
                            rx.el.div(
                                rx.el.span("35%", class_name="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block"),
                                rx.el.p("Logistics (Time/Loc)", class_name="font-medium text-gray-900"),
                                class_name="p-4 bg-white rounded-lg border border-gray-200",
                            ),
                            rx.el.div(
                                rx.el.span("15%", class_name="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block"),
                                rx.el.p("Reliability Score", class_name="font-medium text-gray-900"),
                                class_name="p-4 bg-white rounded-lg border border-gray-200",
                            ),
                            class_name="grid grid-cols-2 md:grid-cols-4 gap-4",
                        ),
                        class_name="max-w-4xl mx-auto",
                    ),
                    class_name="max-w-7xl mx-auto px-6 py-16 text-center",
                ),
                class_name="bg-gray-50",
            ),
            
            class_name="min-h-screen font-['Inter']",
        )
    )
