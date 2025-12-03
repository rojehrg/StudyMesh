import { createContext, useContext, useMemo, useReducer, useState, createElement, useEffect } from "react"
import { applyDelta, ReflexEvent, hydrateClientStorage, useEventLoop, refs } from "$/utils/state"
import { jsx } from "@emotion/react";

export const initialState = {"reflex___state____state": {"class_id_rx_state_": "", "group_id_rx_state_": "", "is_hydrated_rx_state_": false, "router_rx_state_": {"session": {"client_token": "", "client_ip": "", "session_id": ""}, "headers": {"host": "", "origin": "", "upgrade": "", "connection": "", "cookie": "", "pragma": "", "cache_control": "", "user_agent": "", "sec_websocket_version": "", "sec_websocket_key": "", "sec_websocket_extensions": "", "accept_encoding": "", "accept_language": "", "raw_headers": {}}, "page": {"host": "", "path": "", "raw_path": "", "full_path": "", "full_raw_path": "", "params": {}}, "url": "", "route_id": ""}}, "reflex___state____state.app___states___auth_state____auth_state": {"avatar_url_rx_state_": "", "google_email_rx_state_": "", "google_id_rx_state_": "", "google_oauth_url_rx_state_": "https://yrpiyqiocdfbwwtlktgu.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback", "is_authenticated_rx_state_": false, "is_authenticating_rx_state_": false, "oauth_provider_rx_state_": "email", "oauth_url_rx_state_": "", "token_rx_state_": "", "user_email_rx_state_": "", "user_id_rx_state_": -1, "user_name_rx_state_": "", "user_profile_complete_rx_state_": false}, "reflex___state____state.app___states___class_state____class_state": {"current_class_rx_state_": null, "current_class_members_rx_state_": [], "graph_edges_rx_state_": [], "graph_nodes_rx_state_": [], "is_calculating_matches_rx_state_": false, "join_class_code_rx_state_": "", "micro_group_suggestions_rx_state_": [], "new_class_name_rx_state_": "", "new_class_professor_rx_state_": "", "new_class_school_rx_state_": "", "new_class_term_rx_state_": "", "offer_meeting_type_rx_state_": "zoom", "offer_office_building_rx_state_": "", "offer_office_room_rx_state_": "", "offer_recipient_id_rx_state_": -1, "offer_recipient_name_rx_state_": "", "offer_skill_rx_state_": "", "offer_support_queue_rx_state_": [], "offer_zoom_link_rx_state_": "", "recommended_partners_rx_state_": [], "request_support_queue_rx_state_": [], "selected_student_details_rx_state_": null, "selected_student_id_rx_state_": -1, "show_offer_modal_rx_state_": false, "show_student_modal_rx_state_": false, "user_classes_rx_state_": []}, "reflex___state____state.app___states___layout_state____layout_state": {"sidebar_collapsed_rx_state_": false, "sidebar_open_rx_state_": false}, "reflex___state____state.app___states___micro_group_state____micro_group_state": {"available_classmates_rx_state_": [], "avg_compatibility_rx_state_": 0, "common_availability_rx_state_": [], "common_strengths_rx_state_": [], "current_group_rx_state_": null, "current_group_members_rx_state_": [], "generated_intro_message_rx_state_": "", "intro_message_template_rx_state_": "Casual", "join_group_code_rx_state_": "", "new_group_description_rx_state_": "", "new_group_name_rx_state_": "", "selected_classmate_ids_rx_state_": [], "target_class_id_rx_state_": -1, "user_groups_rx_state_": []}, "reflex___state____state.app___states___notification_state____notification_state": {"notifications_rx_state_": [], "show_panel_rx_state_": false, "unread_count_rx_state_": 0}, "reflex___state____state.app___states___profile_state____profile_state": {"academic_goal_rx_state_": "", "academic_goal_options_rx_state_": ["Lead Initiative", "Co-own Deliverable", "Upskill Quickly", "Shadow & Support"], "availability_rx_state_": {"Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []}, "bio_rx_state_": "", "collaboration_options_rx_state_": ["async", "live", "hybrid"], "collaboration_preference_rx_state_": "hybrid", "completion_percentage_rx_state_": 30, "current_projects_rx_state_": [], "current_projects_str_rx_state_": "", "days_of_week_rx_state_": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "department_rx_state_": "", "expertise_input_rx_state_": "", "expertise_skills_rx_state_": [], "group_size_options_rx_state_": ["1-2", "3-4", "4+"], "growth_input_rx_state_": "", "growth_skills_rx_state_": [], "location_preference_rx_state_": "In-person", "major_rx_state_": "", "preferred_group_size_rx_state_": "3-4", "reliability_rx_state_": 0, "strength_options_rx_state_": ["Product Launch Kits", "Process Automation", "Executive Briefings", "Change Management", "Customer Playbooks", "Data Insights", "Compliance Training"], "strengths_rx_state_": [], "study_style_rx_state_": "Product Enablement", "study_style_options_rx_state_": ["Product Enablement", "Revenue Operations", "Customer Success", "Platform Implementation"], "study_time_options_rx_state_": ["Morning Huddles", "Midday Sessions", "Late-Day Reviews", "On-demand / Async"], "study_time_preference_rx_state_": "Morning Huddles", "time_blocks_rx_state_": ["Morning", "Afternoon", "Evening", "Night"], "timezone_rx_state_": ""}, "reflex___state____state.reflex___state____frontend_event_exception_state": {}, "reflex___state____state.reflex___state____on_load_internal_state": {}, "reflex___state____state.reflex___state____update_vars_internal_state": {}}

export const defaultColorMode = "system"
export const ColorModeContext = createContext(null);
export const UploadFilesContext = createContext(null);
export const DispatchContext = createContext(null);
export const StateContexts = {reflex___state____state: createContext(null),reflex___state____state__app___states___auth_state____auth_state: createContext(null),reflex___state____state__app___states___class_state____class_state: createContext(null),reflex___state____state__app___states___layout_state____layout_state: createContext(null),reflex___state____state__app___states___micro_group_state____micro_group_state: createContext(null),reflex___state____state__app___states___notification_state____notification_state: createContext(null),reflex___state____state__app___states___profile_state____profile_state: createContext(null),reflex___state____state__reflex___state____frontend_event_exception_state: createContext(null),reflex___state____state__reflex___state____on_load_internal_state: createContext(null),reflex___state____state__reflex___state____update_vars_internal_state: createContext(null),};
export const EventLoopContext = createContext(null);
export const clientStorage = {"cookies": {}, "local_storage": {}, "session_storage": {}}


export const state_name = "reflex___state____state"

export const exception_state_name = "reflex___state____state.reflex___state____frontend_event_exception_state"

// These events are triggered on initial load and each page navigation.
export const onLoadInternalEvent = () => {
    const internal_events = [];

    // Get tracked cookie and local storage vars to send to the backend.
    const client_storage_vars = hydrateClientStorage(clientStorage);
    // But only send the vars if any are actually set in the browser.
    if (client_storage_vars && Object.keys(client_storage_vars).length !== 0) {
        internal_events.push(
            ReflexEvent(
                'reflex___state____state.reflex___state____update_vars_internal_state.update_vars_internal',
                {vars: client_storage_vars},
            ),
        );
    }

    // `on_load_internal` triggers the correct on_load event(s) for the current page.
    // If the page does not define any on_load event, this will just set `is_hydrated = true`.
    internal_events.push(ReflexEvent('reflex___state____state.reflex___state____on_load_internal_state.on_load_internal'));

    return internal_events;
}

// The following events are sent when the websocket connects or reconnects.
export const initialEvents = () => [
    ReflexEvent('reflex___state____state.hydrate'),
    ...onLoadInternalEvent()
]
    

export const isDevMode = true;

export function UploadFilesProvider({ children }) {
  const [filesById, setFilesById] = useState({})
  refs["__clear_selected_files"] = (id) => setFilesById(filesById => {
    const newFilesById = {...filesById}
    delete newFilesById[id]
    return newFilesById
  })
  return createElement(
    UploadFilesContext.Provider,
    { value: [filesById, setFilesById] },
    children
  );
}

export function ClientSide(component) {
  return ({ children, ...props }) => {
    const [Component, setComponent] = useState(null);
    useEffect(() => {
      setComponent(component);
    }, []);
    return Component ? jsx(Component, props, children) : null;
  };
}

export function EventLoopProvider({ children }) {
  const dispatch = useContext(DispatchContext)
  const [addEvents, connectErrors] = useEventLoop(
    dispatch,
    initialEvents,
    clientStorage,
  )
  return createElement(
    EventLoopContext.Provider,
    { value: [addEvents, connectErrors] },
    children
  );
}

export function StateProvider({ children }) {
  const [reflex___state____state, dispatch_reflex___state____state] = useReducer(applyDelta, initialState["reflex___state____state"])
const [reflex___state____state__app___states___auth_state____auth_state, dispatch_reflex___state____state__app___states___auth_state____auth_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___auth_state____auth_state"])
const [reflex___state____state__app___states___class_state____class_state, dispatch_reflex___state____state__app___states___class_state____class_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___class_state____class_state"])
const [reflex___state____state__app___states___layout_state____layout_state, dispatch_reflex___state____state__app___states___layout_state____layout_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___layout_state____layout_state"])
const [reflex___state____state__app___states___micro_group_state____micro_group_state, dispatch_reflex___state____state__app___states___micro_group_state____micro_group_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___micro_group_state____micro_group_state"])
const [reflex___state____state__app___states___notification_state____notification_state, dispatch_reflex___state____state__app___states___notification_state____notification_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___notification_state____notification_state"])
const [reflex___state____state__app___states___profile_state____profile_state, dispatch_reflex___state____state__app___states___profile_state____profile_state] = useReducer(applyDelta, initialState["reflex___state____state.app___states___profile_state____profile_state"])
const [reflex___state____state__reflex___state____frontend_event_exception_state, dispatch_reflex___state____state__reflex___state____frontend_event_exception_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____frontend_event_exception_state"])
const [reflex___state____state__reflex___state____on_load_internal_state, dispatch_reflex___state____state__reflex___state____on_load_internal_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____on_load_internal_state"])
const [reflex___state____state__reflex___state____update_vars_internal_state, dispatch_reflex___state____state__reflex___state____update_vars_internal_state] = useReducer(applyDelta, initialState["reflex___state____state.reflex___state____update_vars_internal_state"])
  const dispatchers = useMemo(() => {
    return {
      "reflex___state____state": dispatch_reflex___state____state,
"reflex___state____state.app___states___auth_state____auth_state": dispatch_reflex___state____state__app___states___auth_state____auth_state,
"reflex___state____state.app___states___class_state____class_state": dispatch_reflex___state____state__app___states___class_state____class_state,
"reflex___state____state.app___states___layout_state____layout_state": dispatch_reflex___state____state__app___states___layout_state____layout_state,
"reflex___state____state.app___states___micro_group_state____micro_group_state": dispatch_reflex___state____state__app___states___micro_group_state____micro_group_state,
"reflex___state____state.app___states___notification_state____notification_state": dispatch_reflex___state____state__app___states___notification_state____notification_state,
"reflex___state____state.app___states___profile_state____profile_state": dispatch_reflex___state____state__app___states___profile_state____profile_state,
"reflex___state____state.reflex___state____frontend_event_exception_state": dispatch_reflex___state____state__reflex___state____frontend_event_exception_state,
"reflex___state____state.reflex___state____on_load_internal_state": dispatch_reflex___state____state__reflex___state____on_load_internal_state,
"reflex___state____state.reflex___state____update_vars_internal_state": dispatch_reflex___state____state__reflex___state____update_vars_internal_state,
    }
  }, [])

  return (
    createElement(StateContexts.reflex___state____state,{value: reflex___state____state},
createElement(StateContexts.reflex___state____state__app___states___auth_state____auth_state,{value: reflex___state____state__app___states___auth_state____auth_state},
createElement(StateContexts.reflex___state____state__app___states___class_state____class_state,{value: reflex___state____state__app___states___class_state____class_state},
createElement(StateContexts.reflex___state____state__app___states___layout_state____layout_state,{value: reflex___state____state__app___states___layout_state____layout_state},
createElement(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state,{value: reflex___state____state__app___states___micro_group_state____micro_group_state},
createElement(StateContexts.reflex___state____state__app___states___notification_state____notification_state,{value: reflex___state____state__app___states___notification_state____notification_state},
createElement(StateContexts.reflex___state____state__app___states___profile_state____profile_state,{value: reflex___state____state__app___states___profile_state____profile_state},
createElement(StateContexts.reflex___state____state__reflex___state____frontend_event_exception_state,{value: reflex___state____state__reflex___state____frontend_event_exception_state},
createElement(StateContexts.reflex___state____state__reflex___state____on_load_internal_state,{value: reflex___state____state__reflex___state____on_load_internal_state},
createElement(StateContexts.reflex___state____state__reflex___state____update_vars_internal_state,{value: reflex___state____state__reflex___state____update_vars_internal_state},
    createElement(DispatchContext, {value: dispatchers}, children)
    ))))))))))
  )
}