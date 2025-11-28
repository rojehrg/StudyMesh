import reflex as rx
from app.components.sidebar import layout


def faq_item(question: str, answer: str) -> rx.Component:
    return rx.el.div(
        rx.el.h3(question, class_name="font-semibold text-gray-900 mb-2"),
        rx.el.p(answer, class_name="text-gray-600 text-sm leading-relaxed"),
        class_name="bg-white p-6 rounded-xl border border-gray-200 shadow-sm",
    )


def about_page() -> rx.Component:
    return layout(
        rx.el.div(
            rx.el.div(
                rx.el.h1(
                    "About Class Companion",
                    class_name="text-3xl font-bold text-gray-900 mb-4",
                ),
                rx.el.p(
                    "Class Companion uses academic compatibility data to help you find the perfect study partners and groups.",
                    class_name="text-xl text-gray-600 mb-8",
                ),
                class_name="max-w-3xl mx-auto text-center py-12",
            ),
            rx.el.div(
                rx.el.h2(
                    "How Matching Works",
                    class_name="text-2xl font-bold text-gray-900 mb-6 text-center",
                ),
                rx.el.div(
                    faq_item(
                        "Study Styles (20%)",
                        "We match you with people who learn like you do, or complement your style. Visual learners match well with other visual learners or discussion-based learners.",
                    ),
                    faq_item(
                        "Schedules (20%)",
                        "Availability is key. We prioritize partners who prefer to study at the same time of day as you (Morning, Afternoon, Night).",
                    ),
                    faq_item(
                        "Academic Goals (15%)",
                        "Whether you're aiming for an A or just want to pass, we group you with people who have similar ambition levels.",
                    ),
                    faq_item(
                        "Strengths (15%)",
                        "We look for complementary strengths. If you're great at math but need help with writing, we'll match you with a writer who needs math help.",
                    ),
                    class_name="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12",
                ),
            ),
            rx.el.div(
                rx.el.h2(
                    "Frequently Asked Questions",
                    class_name="text-2xl font-bold text-gray-900 mb-6 text-center",
                ),
                rx.el.div(
                    faq_item(
                        "Is my data private?",
                        "Yes. Only students in your specific class can see your profile card and compatibility match.",
                    ),
                    faq_item(
                        "Can I leave a group?",
                        "Absolutely. You can leave any micro group at any time from the group dashboard.",
                    ),
                    faq_item(
                        "How do I create a class?",
                        "Go to 'Create Class' in the sidebar. You'll get a unique code to share with your students or classmates.",
                    ),
                    class_name="grid grid-cols-1 md:grid-cols-3 gap-6",
                ),
            ),
            class_name="p-6 max-w-5xl mx-auto",
        )
    )