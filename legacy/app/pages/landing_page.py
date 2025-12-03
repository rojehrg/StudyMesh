"""
Meshflow Landing Page - Ultra Modern B2B SaaS Design
"""

import reflex as rx
from app.states.auth_state import AuthState


def feature_card(icon: str, title: str, description: str, delay: str = "0ms") -> rx.Component:
    """Create a high-end feature card with subtle interactions."""
    return rx.el.div(
        rx.el.div(
            # Icon Container
            rx.el.div(
                rx.icon(icon, class_name="w-6 h-6 text-indigo-600 group-hover:text-indigo-500 transition-colors"),
                class_name="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300",
            ),
            # Content
            rx.el.h3(
                title,
                class_name="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors",
            ),
            rx.el.p(
                description,
                class_name="text-gray-500 leading-relaxed text-sm",
            ),
            class_name="relative z-10",
        ),
        # Gradient Glow Effect on Hover
        rx.el.div(
            class_name="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl",
        ),
        class_name=(
            "group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm "
            "hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 "
            "transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden"
        ),
        style={"animation-delay": delay},
    )


def step_card(step_num: str, title: str, description: str) -> rx.Component:
    """Create a step card for How It Works section."""
    return rx.el.div(
        rx.el.div(
            rx.el.span(
                step_num,
                class_name="text-6xl font-black text-gray-100/50 absolute -top-2 -right-2 select-none",
            ),
            rx.el.div(
                rx.el.h3(
                    title,
                    class_name="text-xl font-bold text-gray-900 mb-3 relative z-10",
                ),
                rx.el.p(
                    description,
                    class_name="text-gray-600 leading-relaxed text-sm relative z-10",
                ),
            ),
            class_name="relative p-8 h-full z-10",
        ),
        class_name="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative group",
    )


def landing_page() -> rx.Component:
    """Modern B2B SaaS landing page."""
    return rx.el.div(
        # Navigation Bar
        rx.el.nav(
            rx.el.div(
                rx.el.div(
                    rx.el.span("Mesh", class_name="text-indigo-600 font-bold tracking-tight"),
                    rx.el.span("flow", class_name="text-gray-900 font-bold tracking-tight"),
                    class_name="text-2xl flex items-center cursor-pointer select-none",
                ),
                rx.el.div(
                    rx.el.a(
                        "Features",
                        href="#features",
                        class_name="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors",
                    ),
                    rx.el.a(
                        "How It Works",
                        href="#how-it-works",
                        class_name="text-gray-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors",
                    ),
                    class_name="hidden md:flex items-center gap-2",
                ),
                rx.el.div(
                    rx.el.a(
                        "Sign In",
                        href="/login",
                        class_name="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors",
                    ),
                    rx.el.a(
                        "Get Started",
                        href="/signup",
                        class_name="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm",
                    ),
                    class_name="flex items-center gap-4",
                ),
                class_name="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",
            ),
            class_name="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50",
        ),
        
        # Hero Section
        rx.el.section(
            rx.el.div(
                # Grid Background
                rx.el.div(class_name="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none"),
                # Radial Gradient Overlay
                rx.el.div(
                    class_name="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none",
                ),
                
                rx.el.div(
                    rx.el.div(
                        rx.el.span(
                            "✨  New: Smart Matching Engine",
                            class_name="inline-flex items-center bg-white text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold mb-8 animate-fade-in shadow-sm",
                        ),
                        rx.el.h1(
                            "Outperform by Filling",
                            rx.el.br(),
                            rx.el.span(
                                "Knowledge Gaps",
                                class_name="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x",
                            ),
                            class_name="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight animate-fade-in delay-100",
                        ),
                        rx.el.p(
                            "Enable your team to work together seamlessly. Bridge the gap between expertise and need with intelligent, skill-based matching.",
                            class_name="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200",
                        ),
                        rx.el.div(
                            rx.el.a(
                                "Start Enablement",
                                href="/signup",
                                class_name="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 inline-flex items-center justify-center min-w-[160px]",
                            ),
                            rx.el.a(
                                "View Demo",
                                href="#features",
                                class_name="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all inline-flex items-center justify-center min-w-[160px]",
                            ),
                            class_name="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300",
                        ),
                        class_name="text-center relative z-10 max-w-4xl mx-auto",
                    ),
                    class_name="relative max-w-7xl mx-auto px-6 py-24 md:py-32",
                ),
            ),
            class_name="relative overflow-hidden bg-white",
        ),
        
        # Social Proof
        rx.el.section(
            rx.el.div(
                rx.el.p("TRUSTED BY HIGH-PERFORMING TEAMS", class_name="text-center text-xs font-bold text-gray-400 tracking-widest mb-10"),
                rx.el.div(
                    rx.icon("building", class_name="w-8 h-8 text-gray-300 hover:text-gray-400 transition-colors"),
                    rx.icon("globe", class_name="w-8 h-8 text-gray-300 hover:text-gray-400 transition-colors"),
                    rx.icon("server", class_name="w-8 h-8 text-gray-300 hover:text-gray-400 transition-colors"),
                    rx.icon("cloud", class_name="w-8 h-8 text-gray-300 hover:text-gray-400 transition-colors"),
                    rx.icon("database", class_name="w-8 h-8 text-gray-300 hover:text-gray-400 transition-colors"),
                    class_name="flex flex-wrap justify-center gap-16 items-center opacity-70",
                ),
                class_name="max-w-7xl mx-auto px-6 pb-24",
            ),
            class_name="bg-white",
        ),
        
        # Features Section - The "Intelligent Enablement" Upgrade
        rx.el.section(
            # Background Elements
            rx.el.div(
                class_name="absolute inset-0 bg-slate-50",
            ),
            rx.el.div(
                class_name="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none",
            ),
            # Animated Floating Orbs
            rx.el.div(
                class_name="absolute top-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob",
            ),
            rx.el.div(
                class_name="absolute top-20 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000",
            ),
            rx.el.div(
                class_name="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-4000",
            ),
            
            rx.el.div(
                rx.el.div(
                    rx.el.div(
                        rx.el.h2(
                            "Intelligent Enablement",
                            class_name="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center relative z-10",
                        ),
                        rx.el.p(
                            "We constantly outperform because we fill knowledge gaps. Here's how.",
                            class_name="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto relative z-10",
                        ),
                        rx.el.div(
                            feature_card(
                                "brain-circuit",
                                "Smart Gap Analysis",
                                "Our algorithm identifies exactly where your team's knowledge gaps are and pairs members to bridge them instantly.",
                                delay="0ms"
                            ),
                            feature_card(
                                "users",
                                "Enablement Pods",
                                "Organize into focused pods. Connect experts with those who need support, ensuring no one is blocked.",
                                delay="100ms"
                            ),
                            feature_card(
                                "clock",
                                "Always Available",
                                "We match based on availability windows, so support is there exactly when your team needs it.",
                                delay="200ms"
                            ),
                            feature_card(
                                "bar-chart-3",
                                "Performance Tracking",
                                "Visualize how knowledge flows through your organization. See gaps close and performance rise.",
                                delay="300ms"
                            ),
                            feature_card(
                                "shield-check",
                                "Org-Scoped Privacy",
                                "Your data stays within your organization. Secure, private, and focused on internal growth.",
                                delay="400ms"
                            ),
                            feature_card(
                                "sparkles",
                                "Contextual Nudges",
                                "Smart nudges suggest connections with context: 'Ask Sarah for help with Python' or 'Offer help to Tom on Sales'.",
                                delay="500ms"
                            ),
                            class_name="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10",
                        ),
                        class_name="max-w-7xl mx-auto px-6 py-24",
                    ),
                    class_name="relative",
                ),
            ),
            id="features",
            class_name="relative overflow-hidden border-t border-gray-100",
        ),
        
        # How It Works
        rx.el.section(
            rx.el.div(
                rx.el.div(
                    rx.el.h2(
                        "How Meshflow Works",
                        class_name="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center",
                    ),
                    rx.el.div(
                        step_card(
                            "1",
                            "Identify Skills",
                            "Employees list expertise and growth areas. We build a comprehensive skill map of your org.",
                        ),
                        step_card(
                            "2",
                            "Match & Connect",
                            "Our engine automatically pairs knowledge holders with knowledge seekers in real-time.",
                        ),
                        step_card(
                            "3",
                            "Execute & Learn",
                            "Teams collaborate in focused circles to solve problems and transfer knowledge instantly.",
                        ),
                        class_name="grid grid-cols-1 md:grid-cols-3 gap-8",
                    ),
                    class_name="max-w-7xl mx-auto px-6 py-24",
                ),
                class_name="bg-white",
            ),
            id="how-it-works",
        ),
        
        # CTA Section
        rx.el.section(
            rx.el.div(
                rx.el.div(
                    rx.el.h2(
                        "Ready to outperform?",
                        class_name="text-4xl font-bold text-white mb-6 text-center",
                    ),
                    rx.el.p(
                        "Join the teams using Meshflow to close gaps and accelerate delivery.",
                        class_name="text-xl text-indigo-100 text-center mb-10 max-w-2xl mx-auto",
                    ),
                    rx.el.div(
                        rx.el.a(
                            "Start Enablement",
                            href="/signup",
                            class_name="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:scale-105 inline-block",
                        ),
                        class_name="text-center",
                    ),
                    class_name="max-w-4xl mx-auto px-6 py-20 relative z-10",
                ),
                # Abstract Background Shapes
                rx.el.div(class_name="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-40"),
                rx.el.div(class_name="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl opacity-40"),
                
                class_name="bg-gray-900 relative overflow-hidden mx-4 md:mx-6 rounded-3xl mb-12",
            ),
        ),
        
        # Footer
        rx.el.footer(
            rx.el.div(
                rx.el.div(
                    rx.el.span("Mesh", class_name="text-indigo-600 font-bold"),
                    rx.el.span("flow", class_name="text-gray-900 font-bold"),
                    class_name="text-xl mb-4 block",
                ),
                rx.el.p(
                    "© 2025 Meshflow Inc. All rights reserved.",
                    class_name="text-gray-500 text-sm",
                ),
                class_name="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center",
            ),
            class_name="bg-white",
        ),
        
        class_name="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900",
    )
