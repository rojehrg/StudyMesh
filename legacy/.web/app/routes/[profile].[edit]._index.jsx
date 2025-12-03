import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {Bell as LucideBell,BookOpen as LucideBookOpen,ChevronLeft as LucideChevronLeft,CirclePlus as LucideCirclePlus,Info as LucideInfo,LayoutDashboard as LucideLayoutDashboard,LogIn as LucideLogIn,LogOut as LucideLogOut,Menu as LucideMenu,Settings as LucideSettings,Users as LucideUsers,X as LucideX} from "lucide-react"
import {Checkbox as RadixThemesCheckbox,Flex as RadixThemesFlex,Select as RadixThemesSelect,Switch as RadixThemesSwitch,Text as RadixThemesText} from "@radix-ui/themes"
import {jsx} from "@emotion/react"




function Div_c1f3c749b807c06ffcf591c756121421 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("div",{className:"fixed inset-0 bg-black/50 z-40",css:({ ["display"] : (reflex___state____state__app___states___layout_state____layout_state.sidebar_open_rx_state_ ? "block" : "none") }),onClick:on_click_84239a9740330b0568de845c3c7df13e},)
  )
}


function Div_cf3bfc38998bbf0133f7e3164f8aacd7 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "w-8 flex items-center justify-center shrink-0 opacity-100 transition-all duration-300 ease-in-out" : "w-0 max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out")},jsx("span",{className:"text-indigo-600 text-xl font-bold"},"M"))
  )
}


function Div_8dd5926c358d0ba6dd9fce2d4fe66f2e () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 transition-all duration-300 ease-in-out")},jsx("div",{className:"text-xl font-bold whitespace-nowrap"},jsx("span",{className:"text-indigo-600"},"Mesh"),jsx("span",{className:"text-gray-900"},"flow")))
  )
}


function Span_22fd9b1c91c3ab9f59778cea4aa3582b () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("span",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10" : "ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full")},0)
  )
}


function Div_841a513e2fb6d0197bc730b887929e07 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Dashboard"))
  )
}


function Link_69a63451d436e81b7a48463e00bec29b () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/dashboard"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Dashboard" : ""),to:"/dashboard"},jsx("div",{className:"relative flex items-center"},jsx(LucideLayoutDashboard,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_841a513e2fb6d0197bc730b887929e07,{},))
  )
}


function Div_8a1f42bafda17e2f91ed102d1982d0ca () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Pods"))
  )
}


function Link_847e5fb538baaf9cf47476c9e4b01846 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes"?.valueOf?.()) || (((true && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Pods" : ""),to:"/classes"},jsx("div",{className:"relative flex items-center"},jsx(LucideBookOpen,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_8a1f42bafda17e2f91ed102d1982d0ca,{},))
  )
}


function Div_3bc8c724e1436bff334ee3aaedc3057e () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Working Circles"))
  )
}


function Link_a643bd5a2fdb92468b940e3c77c1c953 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/groups"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Working Circles" : ""),to:"/groups"},jsx("div",{className:"relative flex items-center"},jsx(LucideUsers,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_3bc8c724e1436bff334ee3aaedc3057e,{},))
  )
}


function Span_434f864b4543b11e0ea37d5e15e125b0 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state__app___states___notification_state____notification_state = useContext(StateContexts.reflex___state____state__app___states___notification_state____notification_state)



  return (
    jsx("span",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10" : "ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full")},reflex___state____state__app___states___notification_state____notification_state.unread_count_rx_state_)
  )
}


function Fragment_fa84c6bbdc890dbebfd864cb353283c9 () {
  const reflex___state____state__app___states___notification_state____notification_state = useContext(StateContexts.reflex___state____state__app___states___notification_state____notification_state)



  return (
    jsx(Fragment,{},((reflex___state____state__app___states___notification_state____notification_state.unread_count_rx_state_ > 0)?(jsx(Fragment,{},jsx(Span_434f864b4543b11e0ea37d5e15e125b0,{},))):(jsx(Fragment,{},))))
  )
}


function Div_c3643ba9e3f98d533568b2ac9b726ee1 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Notifications"))
  )
}


function Link_c4fdf2d1cd9ddd55be1c35e0956bc8f6 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/notifications"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Notifications" : ""),to:"/notifications"},jsx("div",{className:"relative flex items-center"},jsx(LucideBell,{className:"w-5 h-5 shrink-0"},),jsx(Fragment_fa84c6bbdc890dbebfd864cb353283c9,{},)),jsx(Div_c3643ba9e3f98d533568b2ac9b726ee1,{},))
  )
}


function Div_06937d8f6e01dfc147bd29c3b12a9a2f () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Create Pod"))
  )
}


function Link_4641e0a5c0091f39ccd210ead24d58da () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Create Pod" : ""),to:"/classes/create"},jsx("div",{className:"relative flex items-center"},jsx(LucideCirclePlus,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_06937d8f6e01dfc147bd29c3b12a9a2f,{},))
  )
}


function Div_61f35c0bbbabb38c50a10b9a09e847d5 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Join Pod"))
  )
}


function Link_b22db43b99c88d5971fb5dfeef951e4b () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Join Pod" : ""),to:"/classes/join"},jsx("div",{className:"relative flex items-center"},jsx(LucideLogIn,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_61f35c0bbbabb38c50a10b9a09e847d5,{},))
  )
}


function Div_f1b9ed66d596dd06d8b25a6cb6cf44a3 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"Workspace Settings"))
  )
}


function Link_f14fded0494236a60e20b457eb4e8776 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/settings"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "Workspace Settings" : ""),to:"/settings"},jsx("div",{className:"relative flex items-center"},jsx(LucideSettings,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_f1b9ed66d596dd06d8b25a6cb6cf44a3,{},))
  )
}


function Div_737b80c065530747f571c24ea42b7656 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 ml-0 overflow-hidden transition-all duration-300 ease-in-out" : "max-w-[200px] opacity-100 ml-3 transition-all duration-300 ease-in-out")},jsx("span",{className:"font-medium whitespace-nowrap"},"About Meshflow"))
  )
}


function Link_5039011ba0ea32329847faf98e7d2204 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const reflex___state____state = useContext(StateContexts.reflex___state____state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_84239a9740330b0568de845c3c7df13e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.close_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactRouterLink,{className:(((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/about"?.valueOf?.()) || (((false && reflex___state____state.router_rx_state_?.["page"]?.["path"].startsWith("/classes/")) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/create"?.valueOf?.()))) && !((reflex___state____state.router_rx_state_?.["page"]?.["path"]?.valueOf?.() === "/classes/join"?.valueOf?.())))) ? "flex items-center gap-3 px-4 py-3 rounded-xl border bg-indigo-50 text-indigo-700 border-gray-200 transition-all overflow-hidden whitespace-nowrap" : "flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 overflow-hidden whitespace-nowrap"),onClick:on_click_84239a9740330b0568de845c3c7df13e,title:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "About Meshflow" : ""),to:"/about"},jsx("div",{className:"relative flex items-center"},jsx(LucideInfo,{className:"w-5 h-5 shrink-0"},),jsx(Fragment,{},(false?(jsx(Fragment,{},jsx(Span_22fd9b1c91c3ab9f59778cea4aa3582b,{},))):(jsx(Fragment,{},))))),jsx(Div_737b80c065530747f571c24ea42b7656,{},))
  )
}


function Span_b7fece45f5cca011909ae7733cc9a387 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("span",{className:"text-sm font-semibold"},reflex___state____state__app___states___auth_state____auth_state.user_name_rx_state_?.at?.(0))
  )
}


function Fragment_b73ec1faabe715a815b8b4cb10789917 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___auth_state____auth_state.user_name_rx_state_)?(jsx(Fragment,{},jsx(Span_b7fece45f5cca011909ae7733cc9a387,{},))):(jsx(Fragment,{},jsx("span",{className:"text-sm font-semibold"},"U")))))
  )
}


function P_c7af98e50f7924629072da9c7f654d72 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("p",{className:"font-medium text-sm text-gray-900 truncate"},reflex___state____state__app___states___auth_state____auth_state.user_name_rx_state_)
  )
}


function P_583ba7b2d985ca678eaadc714b2e124b () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("p",{className:"text-xs text-gray-500 truncate"},reflex___state____state__app___states___auth_state____auth_state.user_email_rx_state_)
  )
}


function Button_ac2419d763729507ab73625b05938d51 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_f1f26d3213ef405e40660aa85aba8c1b = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___auth_state____auth_state.logout", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"p-2 ml-2",onClick:on_click_f1f26d3213ef405e40660aa85aba8c1b},jsx(LucideLogOut,{className:"w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"},))
  )
}


function Div_bb63717d23322954c35a9c3dda2ab9f6 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "max-w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out" : "flex items-center w-full max-w-[200px] opacity-100 transition-all duration-300 ease-in-out")},jsx("div",{className:"flex-1 min-w-0 ml-3"},jsx(P_c7af98e50f7924629072da9c7f654d72,{},),jsx(P_583ba7b2d985ca678eaadc714b2e124b,{},)),jsx(Button_ac2419d763729507ab73625b05938d51,{},))
  )
}


function Aside_06c0acd7e6bdf09e1f3254efc9bcd432 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("aside",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_open_rx_state_ ? "fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl transition-transform transform translate-x-0" : "fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl transition-transform transform -translate-x-full")},jsx("div",{className:"flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300"},jsx("div",{className:"flex-1 overflow-x-hidden"},jsx("div",{className:"px-4 pt-6 pb-4"},jsx(ReactRouterLink,{className:"hover:opacity-80 transition-opacity cursor-pointer flex items-center h-8",to:"/landing"},jsx(Div_cf3bfc38998bbf0133f7e3164f8aacd7,{},),jsx(Div_8dd5926c358d0ba6dd9fce2d4fe66f2e,{},))),jsx("nav",{className:"flex flex-col gap-1 px-2"},jsx(Link_69a63451d436e81b7a48463e00bec29b,{},),jsx(Link_847e5fb538baaf9cf47476c9e4b01846,{},),jsx(Link_a643bd5a2fdb92468b940e3c77c1c953,{},),jsx(Link_c4fdf2d1cd9ddd55be1c35e0956bc8f6,{},),jsx(Link_4641e0a5c0091f39ccd210ead24d58da,{},),jsx(Link_b22db43b99c88d5971fb5dfeef951e4b,{},),jsx(Link_f14fded0494236a60e20b457eb4e8776,{},),jsx(Link_5039011ba0ea32329847faf98e7d2204,{},))),jsx("div",{className:"mt-auto overflow-x-hidden"},jsx("div",{className:"flex items-center p-4 border-t border-gray-100"},jsx("div",{className:"flex items-center justify-center"},jsx("div",{className:"w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"},jsx(Fragment_b73ec1faabe715a815b8b4cb10789917,{},))),jsx(Div_bb63717d23322954c35a9c3dda2ab9f6,{},)))))
  )
}


function Aside_1ef380eabec6f8bf6ae3f4d1a32f6e09 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("aside",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "hidden md:flex w-20 flex-col border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ease-in-out" : "hidden md:flex w-64 flex-col border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ease-in-out")},jsx("div",{className:"flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300"},jsx("div",{className:"flex-1 overflow-x-hidden"},jsx("div",{className:"px-4 pt-6 pb-4"},jsx(ReactRouterLink,{className:"hover:opacity-80 transition-opacity cursor-pointer flex items-center h-8",to:"/landing"},jsx(Div_cf3bfc38998bbf0133f7e3164f8aacd7,{},),jsx(Div_8dd5926c358d0ba6dd9fce2d4fe66f2e,{},))),jsx("nav",{className:"flex flex-col gap-1 px-2"},jsx(Link_69a63451d436e81b7a48463e00bec29b,{},),jsx(Link_847e5fb538baaf9cf47476c9e4b01846,{},),jsx(Link_a643bd5a2fdb92468b940e3c77c1c953,{},),jsx(Link_c4fdf2d1cd9ddd55be1c35e0956bc8f6,{},),jsx(Link_4641e0a5c0091f39ccd210ead24d58da,{},),jsx(Link_b22db43b99c88d5971fb5dfeef951e4b,{},),jsx(Link_f14fded0494236a60e20b457eb4e8776,{},),jsx(Link_5039011ba0ea32329847faf98e7d2204,{},))),jsx("div",{className:"mt-auto overflow-x-hidden"},jsx("div",{className:"flex items-center p-4 border-t border-gray-100"},jsx("div",{className:"flex items-center justify-center"},jsx("div",{className:"w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"},jsx(Fragment_b73ec1faabe715a815b8b4cb10789917,{},))),jsx(Div_bb63717d23322954c35a9c3dda2ab9f6,{},)))))
  )
}


function Button_0d8d7a023769a6649a4c5923bdbd66e6 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_fc21a9aa8ba87868d5738987eeb24458 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.toggle_sidebar", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100",onClick:on_click_fc21a9aa8ba87868d5738987eeb24458},jsx(LucideMenu,{className:"w-6 h-6 text-gray-700"},))
  )
}


function Span_275b5bfa77690a44629a2c77031780fa () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx("span",{className:"text-sm font-bold text-indigo-600"},(reflex___state____state__app___states___profile_state____profile_state.completion_percentage_rx_state_+"%"))
  )
}


function Div_8561f130d170e22f94be889f908ae20d () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx("div",{className:"h-2 bg-indigo-600 rounded-full transition-all duration-500",css:({ ["width"] : (reflex___state____state__app___states___profile_state____profile_state.completion_percentage_rx_state_+"%") })},)
  )
}


function Input_14a7c62c64f765abc6ac8c5d634e26a4 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_5a86d1c27cdb2cd51c927d17c415ddab = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_study_style", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",onChange:on_change_5a86d1c27cdb2cd51c927d17c415ddab,placeholder:"e.g. Product Enablement",value:(isNotNullOrUndefined(reflex___state____state__app___states___profile_state____profile_state.study_style_rx_state_) ? reflex___state____state__app___states___profile_state____profile_state.study_style_rx_state_ : "")},)
  )
}


function Select__group_9488707b07be95462074f1f9ef205246 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx(RadixThemesSelect.Group,{},"",Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.study_time_options_rx_state_ ?? [],((item_rx_state_,index_a4c056de887ac0859af139cad1744de9)=>(jsx(RadixThemesSelect.Item,{key:index_a4c056de887ac0859af139cad1744de9,value:item_rx_state_},item_rx_state_)))))
  )
}


function Select__root_60a89b971964a0bc653db7e4b02023c0 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_b7e92a0e417dfb1d0c352143e72f1989 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_study_time_preference", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{className:"w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",onValueChange:on_change_b7e92a0e417dfb1d0c352143e72f1989,value:reflex___state____state__app___states___profile_state____profile_state.study_time_preference_rx_state_},jsx(RadixThemesSelect.Trigger,{},),jsx(RadixThemesSelect.Content,{},jsx(Select__group_9488707b07be95462074f1f9ef205246,{},)))
  )
}


function Select__group_73bb3e75d65582bdc0f9986a2bead4cf () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx(RadixThemesSelect.Group,{},"",Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.group_size_options_rx_state_ ?? [],((item_rx_state_,index_a4c056de887ac0859af139cad1744de9)=>(jsx(RadixThemesSelect.Item,{key:index_a4c056de887ac0859af139cad1744de9,value:item_rx_state_},item_rx_state_)))))
  )
}


function Select__root_b5a9cbcd80fea452ae321c8f2500008e () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_9cc3a24ab4494f1dbc053187c8f1c547 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_preferred_group_size", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{className:"w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",onValueChange:on_change_9cc3a24ab4494f1dbc053187c8f1c547,value:reflex___state____state__app___states___profile_state____profile_state.preferred_group_size_rx_state_},jsx(RadixThemesSelect.Trigger,{},),jsx(RadixThemesSelect.Content,{},jsx(Select__group_73bb3e75d65582bdc0f9986a2bead4cf,{},)))
  )
}


function Div_1222f850366a59635eefe6836cb48ef0 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"flex flex-wrap mb-2"},Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.expertise_skills_rx_state_ ?? [],((skill_rx_state_,index_7b2af9b1db54814c31a128310ea2b8c9)=>(jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2",key:index_7b2af9b1db54814c31a128310ea2b8c9},skill_rx_state_,jsx(LucideX,{className:"ml-1 cursor-pointer hover:text-red-500",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.remove_expertise_skill", ({ ["skill"] : skill_rx_state_ }), ({  })))], [_e], ({  })))),size:14},))))))
  )
}


function Input_679d77743b24f8d165829c9c2a8055d7 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_ff59c9cb0e727f283e600a928e9de746 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_expertise_input", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])
const on_key_down_62d7ba2a57210046c70f62971c7046d1 = useCallback(((_e) => (addEvents([((_e?.["key"]?.valueOf?.() === "Enter"?.valueOf?.()) ? (ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.add_expertise_skill", ({  }), ({  }))) : (ReflexEvent("_call_function", ({ ["function"] : (() => (console?.["log"]("typing..."))), ["callback"] : null }), ({  }))))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",onChange:on_change_ff59c9cb0e727f283e600a928e9de746,onKeyDown:on_key_down_62d7ba2a57210046c70f62971c7046d1,placeholder:"Add a skill...",value:(isNotNullOrUndefined(reflex___state____state__app___states___profile_state____profile_state.expertise_input_rx_state_) ? reflex___state____state__app___states___profile_state____profile_state.expertise_input_rx_state_ : "")},)
  )
}


function Button_9404fa577ffb13ce6c26c5f54dac07de () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_07e5d40eefb786158bdaeaf8b923abce = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.add_expertise_skill", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium",onClick:on_click_07e5d40eefb786158bdaeaf8b923abce,type:"button"},"Add")
  )
}


function Div_c21f1aaa18f340821a8d37593849c653 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"flex flex-wrap mb-2"},Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.growth_skills_rx_state_ ?? [],((skill_rx_state_,index_7b2af9b1db54814c31a128310ea2b8c9)=>(jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2",key:index_7b2af9b1db54814c31a128310ea2b8c9},skill_rx_state_,jsx(LucideX,{className:"ml-1 cursor-pointer hover:text-red-500",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.remove_growth_skill", ({ ["skill"] : skill_rx_state_ }), ({  })))], [_e], ({  })))),size:14},))))))
  )
}


function Input_2b79f5a40edd68abe015384de14f7786 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_f4a98b05be811b74f90dabeee510bb49 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_growth_input", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])
const on_key_down_1571ca9e24f57c063017f3df64fce801 = useCallback(((_e) => (addEvents([((_e?.["key"]?.valueOf?.() === "Enter"?.valueOf?.()) ? (ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.add_growth_skill", ({  }), ({  }))) : (ReflexEvent("_call_function", ({ ["function"] : (() => (console?.["log"]("typing..."))), ["callback"] : null }), ({  }))))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",onChange:on_change_f4a98b05be811b74f90dabeee510bb49,onKeyDown:on_key_down_1571ca9e24f57c063017f3df64fce801,placeholder:"Add a skill...",value:(isNotNullOrUndefined(reflex___state____state__app___states___profile_state____profile_state.growth_input_rx_state_) ? reflex___state____state__app___states___profile_state____profile_state.growth_input_rx_state_ : "")},)
  )
}


function Button_12efa3e1d4a913eb15671f58ae0e069f () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_f618929e58ac94f285d3d8f94c84c714 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.add_growth_skill", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium",onClick:on_click_f618929e58ac94f285d3d8f94c84c714,type:"button"},"Add")
  )
}


function Input_6bce08c1c56f400d241f4d92f24b15f2 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_2e468cc68bd943ebb165c9f760d88cb3 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_academic_goal", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",defaultValue:reflex___state____state__app___states___profile_state____profile_state.academic_goal_rx_state_,onChange:on_change_2e468cc68bd943ebb165c9f760d88cb3,placeholder:"e.g. Lead Q4 Product Launch, Master Advanced Analytics, Build Customer Success Playbooks"},)
  )
}


function Input_85b5c5264fe49f8c374daf0890681da5 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_027262b58962f6a7861bc9176c00c43f = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_department", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",defaultValue:reflex___state____state__app___states___profile_state____profile_state.department_rx_state_,onChange:on_change_027262b58962f6a7861bc9176c00c43f,placeholder:"e.g. Sales, Engineering, Customer Success"},)
  )
}


function Select__group_ede9ad249b137535ea21afd5018aa70d () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx(RadixThemesSelect.Group,{},"",Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.collaboration_options_rx_state_ ?? [],((item_rx_state_,index_a4c056de887ac0859af139cad1744de9)=>(jsx(RadixThemesSelect.Item,{key:index_a4c056de887ac0859af139cad1744de9,value:item_rx_state_},item_rx_state_)))))
  )
}


function Select__root_2bc04997f35472f1e79f6622f8598318 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_d4b4e2a348866f9413bed1f87980d4d1 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_collaboration_preference", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{className:"w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer",onValueChange:on_change_d4b4e2a348866f9413bed1f87980d4d1,value:reflex___state____state__app___states___profile_state____profile_state.collaboration_preference_rx_state_},jsx(RadixThemesSelect.Trigger,{},),jsx(RadixThemesSelect.Content,{},jsx(Select__group_ede9ad249b137535ea21afd5018aa70d,{},)))
  )
}


function Switch_64b4d70cc7dcac22b3e46e30bbb3010e () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_dd8f2dbffe0b2e7f050d4573a8d353cf = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_location_preference", ({ ["value"] : (_ev_0 ? "In-person" : "Remote") }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSwitch,{checked:((reflex___state____state__app___states___profile_state____profile_state.location_preference_rx_state_?.valueOf?.() === "In-person"?.valueOf?.()) ? true : false),onCheckedChange:on_change_dd8f2dbffe0b2e7f050d4573a8d353cf},)
  )
}


function Input_509dfa356ca5683e88a696f6665e0050 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_aedb39a7842faa719948be5eed88ecee = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_timezone", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",defaultValue:reflex___state____state__app___states___profile_state____profile_state.timezone_rx_state_,onChange:on_change_aedb39a7842faa719948be5eed88ecee,placeholder:"e.g. US/Eastern"},)
  )
}


function Div_ad2d33cc0e42e7fdb7131f7b8a17b0d0 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx("div",{className:"grid grid-cols-5 gap-2 mb-2"},jsx("div",{className:"w-20"},""),Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.time_blocks_rx_state_ ?? [],((time_rx_state_,index_1f8733dafcf01b382a028b8f8527100b)=>(jsx("div",{className:"text-xs font-medium text-gray-500 text-center",key:index_1f8733dafcf01b382a028b8f8527100b},time_rx_state_)))))
  )
}


function Div_8a7f94341c247b91c52fd7728783d634 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"w-full overflow-x-auto"},jsx(Div_ad2d33cc0e42e7fdb7131f7b8a17b0d0,{},),Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.days_of_week_rx_state_ ?? [],((day_rx_state_,index_54a1be3b6010d50ba0f09f76322e56c5)=>(jsx("div",{className:"grid grid-cols-5 gap-2 items-center py-2 border-b border-gray-50 last:border-0",key:index_54a1be3b6010d50ba0f09f76322e56c5},jsx("div",{className:"text-xs font-medium text-gray-700 w-20 pt-1"},day_rx_state_),Array.prototype.map.call(reflex___state____state__app___states___profile_state____profile_state.time_blocks_rx_state_ ?? [],((time_rx_state_,index_0c5e4c3191a0f4afc1c2e7d49ef733d1)=>(jsx("div",{className:"flex justify-center",key:index_0c5e4c3191a0f4afc1c2e7d49ef733d1},jsx(RadixThemesText,{as:"label",size:"2"},jsx(RadixThemesFlex,{gap:"2"},jsx(RadixThemesCheckbox,{checked:reflex___state____state__app___states___profile_state____profile_state.availability_rx_state_?.[day_rx_state_].includes(time_rx_state_),onCheckedChange:((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_availability", ({ ["day"] : day_rx_state_, ["time_block"] : time_rx_state_, ["checked"] : _ev_0 }), ({  })))], [_ev_0], ({  })))),size:"2"},),"")))))))))))
  )
}


function Input_eb103b0200ecff46e349ef91ddb30239 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_6ee9ccd839f89a775ce913923ff6e8ac = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_reliability", ({ ["value"] : (Number(_e?.["target"]?.["value"])) }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600",max:"5",min:"1",onChange:on_change_6ee9ccd839f89a775ce913923ff6e8ac,step:"1",type:"range",value:(isNotNullOrUndefined(reflex___state____state__app___states___profile_state____profile_state.reliability_rx_state_) ? reflex___state____state__app___states___profile_state____profile_state.reliability_rx_state_ : "")},)
  )
}


function P_c669da9bf990be3f580aebc238339f39 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx("p",{className:"text-sm font-medium text-indigo-600 mt-3"},("Current rating: "+reflex___state____state__app___states___profile_state____profile_state.reliability_rx_state_+"/5"))
  )
}


function Fragment_a29caee1c6156db1bf6c12747e998b88 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)



  return (
    jsx(Fragment,{},((reflex___state____state__app___states___profile_state____profile_state.reliability_rx_state_ > 0)?(jsx(Fragment,{},jsx("div",{className:"text-center"},jsx(P_c669da9bf990be3f580aebc238339f39,{},)))):(jsx(Fragment,{},))))
  )
}


function Input_509014c91419784acd56daac66a450d4 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_648eb537d1f2101de994354009f89a77 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_major", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",defaultValue:reflex___state____state__app___states___profile_state____profile_state.major_rx_state_,onChange:on_change_648eb537d1f2101de994354009f89a77,placeholder:"e.g. Revenue Acceleration Squad"},)
  )
}


function Input_7c6d21d3373028283e0828cd3e505087 () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_135205db19a7da11aaa7eeac598830e2 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_current_projects", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",onChange:on_change_135205db19a7da11aaa7eeac598830e2,placeholder:"e.g. Q3 Product Launch, Customer Onboarding Initiative",value:(isNotNullOrUndefined(reflex___state____state__app___states___profile_state____profile_state.current_projects_str_rx_state_) ? reflex___state____state__app___states___profile_state____profile_state.current_projects_str_rx_state_ : "")},)
  )
}


function Textarea_b38e33d3e162c6d2159695018f2f4a9c () {
  const reflex___state____state__app___states___profile_state____profile_state = useContext(StateContexts.reflex___state____state__app___states___profile_state____profile_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_921a4e4736e372b50623096bff3915a1 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.set_bio", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("textarea",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none focus:placeholder-transparent",defaultValue:reflex___state____state__app___states___profile_state____profile_state.bio_rx_state_,onChange:on_change_921a4e4736e372b50623096bff3915a1,placeholder:"Share your background, current initiatives, and the kind of help you can offer or need."},)
  )
}


function Button_0d3f633fd0a24c25c732066d4c840d40 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_908aca9c8b6b04fea039f4f37352e13c = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___profile_state____profile_state.save_profile", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg",onClick:on_click_908aca9c8b6b04fea039f4f37352e13c},"Save Profile")
  )
}


function Div_5e216a5a5469e9b393ad986d72668053 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("div",{className:"max-w-2xl mx-auto w-full pb-12",key:("profile_form_"+reflex___state____state__app___states___auth_state____auth_state.user_id_rx_state_)},jsx("div",{className:"bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("div",{className:"flex justify-between mb-2"},jsx("span",{className:"text-sm font-medium text-gray-700"},"Enablement Profile"),jsx(Span_275b5bfa77690a44629a2c77031780fa,{},)),jsx("div",{className:"w-full h-2 bg-gray-200 rounded-full overflow-hidden"},jsx(Div_8561f130d170e22f94be889f908ae20d,{},))),jsx("div",{className:"bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4"},"Enablement Focus"),jsx("div",{className:"space-y-4"},jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Primary expertise area",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_14a7c62c64f765abc6ac8c5d634e26a4,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Where do you need support most?",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Select__root_60a89b971964a0bc653db7e4b02023c0,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Preferred collaboration circle size",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Select__root_b5a9cbcd80fea452ae321c8f2500008e,{},)))),jsx("div",{className:"bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4"},"Capabilities & Growth Goals"),jsx("div",{className:"space-y-4"},jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Skills I can teach/mentor (Expertise)",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx("div",{className:"space-y-2"},jsx("p",{className:"text-xs text-gray-500 mb-2"},"Type a skill and press Enter to add it."),jsx(Div_1222f850366a59635eefe6836cb48ef0,{},),jsx(Input_679d77743b24f8d165829c9c2a8055d7,{},),jsx(Button_9404fa577ffb13ce6c26c5f54dac07de,{},))),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Skills I want to learn (Growth Areas)",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx("div",{className:"space-y-2"},jsx("p",{className:"text-xs text-gray-500 mb-2"},"Type a skill and press Enter to add it."),jsx(Div_c21f1aaa18f340821a8d37593849c653,{},),jsx(Input_2b79f5a40edd68abe015384de14f7786,{},),jsx(Button_12efa3e1d4a913eb15671f58ae0e069f,{},))),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Engagement objective",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_6bce08c1c56f400d241f4d92f24b15f2,{},)))),jsx("div",{className:"bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4"},"Collaboration Logistics"),jsx("div",{className:"space-y-4"},jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Department",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_85b5c5264fe49f8c374daf0890681da5,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Collaboration preference",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Select__root_2bc04997f35472f1e79f6622f8598318,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Session format preference",jsx(Fragment,{},(true?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx("div",{className:"flex items-center"},jsx("span",{className:"text-sm text-gray-600 mr-3"},"Remote"),jsx(Switch_64b4d70cc7dcac22b3e46e30bbb3010e,{},),jsx("span",{className:"text-sm text-gray-600 ml-3"},"In-person"))),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Primary timezone",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_509dfa356ca5683e88a696f6665e0050,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Meeting availability",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Div_8a7f94341c247b91c52fd7728783d634,{},)))),jsx("div",{className:"bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4"},"Reliability & Collaboration"),jsx("div",{className:"space-y-4"},jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Self-Rated Reliability",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx("div",{},jsx("p",{className:"text-sm text-gray-600 mb-4"},"How reliable are you at following through on commitments? This helps us match you with the right opportunities."),jsx("div",{className:"w-full"},jsx("div",{className:"flex justify-between mb-2"},jsx("span",{className:"text-xs text-gray-500"},"1"),jsx("span",{className:"text-xs text-gray-500"},"5")),jsx(Input_eb103b0200ecff46e349ef91ddb30239,{},),jsx("div",{className:"flex justify-between mt-1"},jsx("span",{className:"text-xs text-gray-500"},"Low"),jsx("span",{className:"text-xs text-gray-500"},"High")),jsx(Fragment_a29caee1c6156db1bf6c12747e998b88,{},)))))),jsx("div",{className:"bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"},jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4"},"About Your Work"),jsx("div",{className:"space-y-4"},jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Current teams / projects",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_509014c91419784acd56daac66a450d4,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Current projects (comma-separated)",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Input_7c6d21d3373028283e0828cd3e505087,{},)),jsx("div",{className:"w-full"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"How teammates can partner with you",jsx(Fragment,{},(false?(jsx(Fragment,{},jsx("span",{className:"text-red-500 ml-1"},"*"))):(jsx(Fragment,{},))))),jsx(Textarea_b38e33d3e162c6d2159695018f2f4a9c,{},)))),jsx("div",{className:"sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg"},jsx(Button_0d3f633fd0a24c25c732066d4c840d40,{},)))
  )
}


function Chevronleft_c1db7e0179d6c97cb13ef1a4b072a4a8 () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx(LucideChevronLeft,{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "w-5 h-5 rotate-180 transition-transform duration-300" : "w-5 h-5 transition-transform duration-300")},)
  )
}


function Button_5c3b3b0b916bef960265a28869919bde () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_aea9142169a644d38baea41964d519cc = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___layout_state____layout_state.toggle_sidebar_collapse", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"hidden md:flex fixed top-1/2 -translate-y-1/2 z-[60] bg-white border border-l-0 border-gray-200 rounded-r-lg p-2 shadow-lg hover:shadow-xl text-gray-700 hover:text-indigo-600 transition-all duration-300 hover:bg-gray-50 cursor-pointer items-center justify-center",css:({ ["&"] : (reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? ({ ["left"] : "5rem", ["transition"] : "left 0.3s ease-in-out" }) : ({ ["left"] : "16rem", ["transition"] : "left 0.3s ease-in-out" })) }),onClick:on_click_aea9142169a644d38baea41964d519cc},jsx(Chevronleft_c1db7e0179d6c97cb13ef1a4b072a4a8,{},))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx("div",{className:"flex w-full min-h-screen bg-gray-50"},jsx("div",{},jsx(Div_c1f3c749b807c06ffcf591c756121421,{},),jsx(Aside_06c0acd7e6bdf09e1f3254efc9bcd432,{},)),jsx(Aside_1ef380eabec6f8bf6ae3f4d1a32f6e09,{},),jsx("div",{className:"flex-1 flex flex-col min-w-0"},jsx("header",{className:"md:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30"},jsx(Button_0d8d7a023769a6649a4c5923bdbd66e6,{},),jsx(ReactRouterLink,{className:"text-lg font-bold text-indigo-600 hover:opacity-80 transition-opacity",to:"/landing"},"Meshflow")),jsx("main",{className:"flex-1 bg-gray-50 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-auto transition-all duration-300"},jsx("div",{className:"max-w-4xl mx-auto p-6"},jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-6"},"Edit Profile"),jsx(Div_5e216a5a5469e9b393ad986d72668053,{},)))),jsx(Button_5c3b3b0b916bef960265a28869919bde,{},)),jsx("title",{},"App | Edit"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}