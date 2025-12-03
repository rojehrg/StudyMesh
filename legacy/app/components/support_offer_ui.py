"""
Support Offer UI Components - Meeting location and Zoom link functionality
"""

import reflex as rx
from app.states.class_state import ClassState


def support_offer_modal() -> rx.Component:
    """Modal for offering support with meeting location/zoom link."""
    return rx.cond(
        ClassState.show_offer_modal,
        rx.el.div(
            # Backdrop
            rx.el.div(
                class_name="fixed inset-0 bg-black/50 z-50",
                on_click=lambda: ClassState.set_show_offer_modal(False),
            ),
            # Modal
            rx.el.div(
                rx.el.div(
                    rx.el.div(
                        rx.el.h3(
                            f"Offer Support to {ClassState.offer_recipient_name}",
                            class_name="text-xl font-bold text-gray-900 mb-2",
                        ),
                        rx.el.p(
                            "Add meeting details so they can easily connect with you.",
                            class_name="text-sm text-gray-600 mb-6",
                        ),
                        rx.el.form(
                            rx.el.div(
                                rx.el.label(
                                    "Skill/Area You're Offering",
                                    class_name="block text-sm font-medium text-gray-700 mb-1",
                                ),
                                rx.el.input(
                                    placeholder="e.g. Product Launch Kits, Process Automation",
                                    on_change=ClassState.set_offer_skill,
                                    class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                                    default_value=ClassState.offer_skill,
                                ),
                                class_name="mb-4",
                            ),
                            rx.el.div(
                                rx.el.label(
                                    "Meeting Type",
                                    class_name="block text-sm font-medium text-gray-700 mb-2",
                                ),
                                rx.el.div(
                                    rx.el.label(
                                        rx.el.input(
                                            type="radio",
                                            name="meeting_type",
                                            value="zoom",
                                            checked=ClassState.offer_meeting_type == "zoom",
                                            on_change=lambda: ClassState.set_offer_meeting_type("zoom"),
                                            class_name="mr-2",
                                        ),
                                        "Zoom / Virtual",
                                        class_name="flex items-center cursor-pointer",
                                    ),
                                    rx.el.label(
                                        rx.el.input(
                                            type="radio",
                                            name="meeting_type",
                                            value="office",
                                            checked=ClassState.offer_meeting_type == "office",
                                            on_change=lambda: ClassState.set_offer_meeting_type("office"),
                                            class_name="mr-2",
                                        ),
                                        "In-Office",
                                        class_name="flex items-center cursor-pointer",
                                    ),
                                    rx.el.label(
                                        rx.el.input(
                                            type="radio",
                                            name="meeting_type",
                                            value="hybrid",
                                            checked=ClassState.offer_meeting_type == "hybrid",
                                            on_change=lambda: ClassState.set_offer_meeting_type("hybrid"),
                                            class_name="mr-2",
                                        ),
                                        "Hybrid",
                                        class_name="flex items-center cursor-pointer",
                                    ),
                                    class_name="flex flex-col gap-2",
                                ),
                                class_name="mb-4",
                            ),
                            rx.cond(
                                (ClassState.offer_meeting_type == "zoom") | (ClassState.offer_meeting_type == "hybrid"),
                                rx.el.div(
                                    rx.el.label(
                                        "Zoom Link",
                                        class_name="block text-sm font-medium text-gray-700 mb-1",
                                    ),
                                    rx.el.input(
                                        placeholder="https://zoom.us/j/123456789",
                                        on_change=ClassState.set_offer_zoom_link,
                                        class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                                        default_value=ClassState.offer_zoom_link,
                                    ),
                                    class_name="mb-4",
                                ),
                            ),
                            rx.cond(
                                (ClassState.offer_meeting_type == "office") | (ClassState.offer_meeting_type == "hybrid"),
                                rx.el.div(
                                    rx.el.div(
                                        rx.el.label(
                                            "Building",
                                            class_name="block text-sm font-medium text-gray-700 mb-1",
                                        ),
                                        rx.el.input(
                                            placeholder="e.g. Main Office, Building A",
                                            on_change=ClassState.set_offer_office_building,
                                            class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                                            default_value=ClassState.offer_office_building,
                                        ),
                                        class_name="mb-4",
                                    ),
                                    rx.el.div(
                                        rx.el.label(
                                            "Room",
                                            class_name="block text-sm font-medium text-gray-700 mb-1",
                                        ),
                                        rx.el.input(
                                            placeholder="e.g. Conference Room 3B, Desk 42",
                                            on_change=ClassState.set_offer_office_room,
                                            class_name="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",
                                            default_value=ClassState.offer_office_room,
                                        ),
                                        class_name="mb-4",
                                    ),
                                ),
                            ),
                            rx.el.div(
                                rx.el.button(
                                    "Cancel",
                                    type="button",
                                    on_click=lambda: ClassState.set_show_offer_modal(False),
                                    class_name="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium mr-3",
                                ),
                                rx.el.button(
                                    "Send Offer",
                                    type="submit",
                                    on_click=ClassState.create_support_offer,
                                    class_name="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium",
                                ),
                                class_name="flex justify-end mt-6",
                            ),
                            class_name="w-full",
                        ),
                        class_name="p-6",
                    ),
                    class_name="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto",
                ),
                class_name="fixed inset-0 z-50 flex items-center justify-center p-4",
            ),
        ),
    )

