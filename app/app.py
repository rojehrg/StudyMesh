import reflex as rx
import reflex_enterprise as rxe
from app.pages.auth_pages import login_page, signup_page
from app.pages.profile_pages import profile_setup_page, profile_edit_page
from app.pages.class_pages import (
    classes_list_page,
    create_class_page,
    join_class_page,
    class_dashboard_page,
)
from app.states.auth_state import AuthState
from app.states.class_state import ClassState
from app.states.profile_state import ProfileState
from app.utils.db_init import init_db

init_db()
app = rxe.App(
    theme=rx.theme(appearance="light"),
    head_components=[
        rx.el.link(rel="preconnect", href="https://fonts.googleapis.com"),
        rx.el.link(rel="preconnect", href="https://fonts.gstatic.com", cross_origin=""),
        rx.el.link(
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            rel="stylesheet",
        ),
    ],
)
app.add_page(login_page, route="/login", on_load=AuthState.check_auth)
app.add_page(signup_page, route="/signup", on_load=AuthState.check_auth)
app.add_page(
    profile_setup_page,
    route="/profile-setup",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    profile_edit_page,
    route="/profile/edit",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ProfileState.load_profile,
    ],
)
app.add_page(
    classes_list_page,
    route="/",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_user_classes,
    ],
)
app.add_page(
    classes_list_page,
    route="/classes",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_user_classes,
    ],
)
app.add_page(
    create_class_page,
    route="/classes/create",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    join_class_page,
    route="/classes/join",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    class_dashboard_page,
    route="/classes/[class_id]",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ClassState.load_class_details,
    ],
)
from app.pages.micro_group_pages import (
    my_groups_page,
    create_group_page,
    join_group_page,
    group_dashboard_page,
)
from app.states.micro_group_state import MicroGroupState
from app.pages.settings_page import settings_page
from app.pages.about_page import about_page

app.add_page(
    my_groups_page,
    route="/groups",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        MicroGroupState.load_user_groups,
    ],
)
app.add_page(
    create_group_page,
    route="/groups/create",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    join_group_page,
    route="/groups/join",
    on_load=[AuthState.check_auth, AuthState.ensure_auth_access],
)
app.add_page(
    group_dashboard_page,
    route="/groups/[group_id]",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        MicroGroupState.load_group_details,
    ],
)
app.add_page(
    settings_page,
    route="/settings",
    on_load=[
        AuthState.check_auth,
        AuthState.ensure_auth_access,
        ProfileState.load_profile,
    ],
)
app.add_page(about_page, route="/about", on_load=[AuthState.check_auth])