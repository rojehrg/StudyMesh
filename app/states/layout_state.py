import reflex as rx


class LayoutState(rx.State):
    """State management for UI layout."""

    sidebar_open: bool = False

    @rx.event
    def toggle_sidebar(self):
        self.sidebar_open = not self.sidebar_open

    @rx.event
    def close_sidebar(self):
        self.sidebar_open = False