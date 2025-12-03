import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isTrue} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {Bell as LucideBell,BookOpen as LucideBookOpen,ChevronLeft as LucideChevronLeft,CirclePlus as LucideCirclePlus,Copy as LucideCopy,Info as LucideInfo,LayoutDashboard as LucideLayoutDashboard,LogIn as LucideLogIn,LogOut as LucideLogOut,Mail as LucideMail,Menu as LucideMenu,MessageCircle as LucideMessageCircle,Settings as LucideSettings,Trash2 as LucideTrash2,User as LucideUser,Users as LucideUsers} from "lucide-react"
import {Spinner as RadixThemesSpinner} from "@radix-ui/themes"
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


function H1_519774b633a408a6c46f2274ba114ee6 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("h1",{className:"text-2xl font-bold text-gray-900 mr-4"},reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_rx_state_?.["name"])
  )
}


function P_aee2f6dfd879b05b0cfe602a40a7779f () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("p",{className:"text-gray-500"},reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_rx_state_?.["description"])
  )
}


function Span_70871a50c44e21d065c2fb8f7cd7cf7c () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("span",{className:"text-2xl font-mono font-bold tracking-widest text-indigo-600"},reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_rx_state_?.["group_code"])
  )
}


function Button_74b866986a5ce0ed812e739e9509e766 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_f6739e1c9764a1320607cdeb5a434331 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___micro_group_state____micro_group_state.copy_group_code", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"p-2 hover:bg-gray-100 rounded-lg transition-colors",onClick:on_click_f6739e1c9764a1320607cdeb5a434331},jsx(LucideCopy,{className:"w-5 h-5 text-gray-400 hover:text-indigo-600"},))
  )
}


function Div_bab45277448bc97fd6208633810fa896 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"flex gap-2 mb-3"},Array.prototype.map.call(["Quick Win", "Deep Dive", "Shadowing"] ?? [],((t_rx_state_,index_35f54484cfc7cba22ee0c21ac9a2180b)=>(jsx("button",{className:((reflex___state____state__app___states___micro_group_state____micro_group_state.intro_message_template_rx_state_?.valueOf?.() === t_rx_state_?.valueOf?.()) ? "px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium border border-indigo-200" : "px-3 py-1 text-xs rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"),key:index_35f54484cfc7cba22ee0c21ac9a2180b,onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___micro_group_state____micro_group_state.update_intro_template", ({ ["template"] : t_rx_state_ }), ({  })))], [_e], ({  }))))},t_rx_state_)))))
  )
}


function P_1660c5478ebc2bf74b510f19a3a858b6 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("p",{className:"text-sm text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 mb-3"},reflex___state____state__app___states___micro_group_state____micro_group_state.generated_intro_message_rx_state_)
  )
}


function Link_f9bbe30f8de27cc1eeb741f6156e6843 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx(ReactRouterLink,{className:"bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors flex-1 justify-center",target:"_blank",to:("https://wa.me/?text="+reflex___state____state__app___states___micro_group_state____micro_group_state.generated_intro_message_rx_state_)},jsx(LucideMessageCircle,{className:"w-4 h-4 mr-2"},),"WhatsApp")
  )
}


function Link_ec2de69561b1ab953dc86ec312634bc4 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx(ReactRouterLink,{className:"bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors flex-1 justify-center",target:"_blank",to:("mailto:?subject=Join my Working Circle&body="+reflex___state____state__app___states___micro_group_state____micro_group_state.generated_intro_message_rx_state_)},jsx(LucideMail,{className:"w-4 h-4 mr-2"},),"Email")
  )
}


function Div_51121faee8618d75303c35685bfc049f () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)
const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"space-y-2"},Array.prototype.map.call(reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_members_rx_state_ ?? [],((member_rx_state_,index_2f46bc10be22f55adeaeb92ef86ff166)=>(jsx("div",{className:"flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100",key:index_2f46bc10be22f55adeaeb92ef86ff166},jsx("div",{className:"flex items-center"},jsx("div",{className:"w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3"},jsx(LucideUser,{className:"w-5 h-5 text-gray-600"},)),jsx("div",{},jsx("p",{className:"font-medium text-gray-900 text-sm"},member_rx_state_?.["name"]),jsx("p",{className:"text-xs text-gray-500"},member_rx_state_?.["email"]))),jsx(Fragment,{},((reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_rx_state_?.["created_by"]?.valueOf?.() === reflex___state____state__app___states___auth_state____auth_state.user_id_rx_state_?.valueOf?.())?(jsx(Fragment,{},((member_rx_state_?.["id"]?.valueOf?.() !== reflex___state____state__app___states___auth_state____auth_state.user_id_rx_state_?.valueOf?.())?(jsx(Fragment,{},jsx("button",{className:"text-gray-400 hover:text-red-500 p-1 rounded transition-colors",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___micro_group_state____micro_group_state.remove_member", ({ ["user_id"] : member_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},jsx(LucideTrash2,{className:"w-4 h-4"},)))):(jsx(Fragment,{},))))):(jsx(Fragment,{},)))))))))
  )
}


function Span_cf4d7c2bcd8cb002d355384e51b8b7c8 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("span",{className:"text-2xl font-bold text-indigo-600"},(reflex___state____state__app___states___micro_group_state____micro_group_state.avg_compatibility_rx_state_+"%"))
  )
}


function Div_bc5f164136a8d7024060c900ab939edc () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("div",{className:"h-full bg-indigo-500",css:({ ["width"] : (reflex___state____state__app___states___micro_group_state____micro_group_state.avg_compatibility_rx_state_+"%") })},)
  )
}


function Div_b0c55d9df63013e91858f74f23f64548 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("div",{},Array.prototype.map.call(reflex___state____state__app___states___micro_group_state____micro_group_state.common_strengths_rx_state_ ?? [],((s_rx_state_,index_1f8733dafcf01b382a028b8f8527100b)=>(jsx("span",{className:"text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 mr-1 mb-1 inline-block",key:index_1f8733dafcf01b382a028b8f8527100b},s_rx_state_)))))
  )
}


function Fragment_81212ff9beb7f505091f700b41b92eb5 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___micro_group_state____micro_group_state.common_strengths_rx_state_)?(jsx(Fragment,{},jsx(Div_b0c55d9df63013e91858f74f23f64548,{},))):(jsx(Fragment,{},jsx("span",{className:"text-sm text-gray-400 italic"},"No clear common strengths yet")))))
  )
}


function Div_e94943814da9de261c2ce57cd79a880d () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx("div",{},Array.prototype.map.call(reflex___state____state__app___states___micro_group_state____micro_group_state.common_availability_rx_state_ ?? [],((d_rx_state_,index_1f8733dafcf01b382a028b8f8527100b)=>(jsx("span",{className:"text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 mr-1 mb-1 inline-block",key:index_1f8733dafcf01b382a028b8f8527100b},d_rx_state_)))))
  )
}


function Fragment_d171f9f3b354fdc12c22bf603f2bdc0b () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___micro_group_state____micro_group_state.common_availability_rx_state_)?(jsx(Fragment,{},jsx(Div_e94943814da9de261c2ce57cd79a880d,{},))):(jsx(Fragment,{},jsx("span",{className:"text-sm text-gray-400 italic"},"No common days found")))))
  )
}


function Fragment_ebe5ecb93932bc0b6913af8574ad8477 () {
  const reflex___state____state__app___states___micro_group_state____micro_group_state = useContext(StateContexts.reflex___state____state__app___states___micro_group_state____micro_group_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___micro_group_state____micro_group_state.current_group_rx_state_)?(jsx(Fragment,{},jsx("div",{},jsx("div",{className:"mb-6 border-b border-gray-200 pb-4"},jsx(H1_519774b633a408a6c46f2274ba114ee6,{},),jsx(P_aee2f6dfd879b05b0cfe602a40a7779f,{},)),jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"},jsx("div",{className:"col-span-1 md:col-span-2 lg:col-span-1"},jsx("div",{},jsx("h3",{className:"text-lg font-bold text-gray-900 mb-3"},"Invite collaborators"),jsx("div",{className:"bg-white p-5 rounded-xl border border-gray-200 shadow-sm"},jsx("div",{className:"bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4"},jsx("span",{className:"text-xs text-gray-500 uppercase font-semibold block mb-1"},"Circle Code"),jsx("div",{className:"flex justify-between items-center"},jsx(Span_70871a50c44e21d065c2fb8f7cd7cf7c,{},),jsx(Button_74b866986a5ce0ed812e739e9509e766,{},))),jsx("div",{},jsx("p",{className:"text-sm font-medium text-gray-700 mb-2"},"Share a kickoff note"),jsx(Div_bab45277448bc97fd6208633810fa896,{},),jsx("div",{},jsx(P_1660c5478ebc2bf74b510f19a3a858b6,{},),jsx("div",{className:"flex gap-2"},jsx(Link_f9bbe30f8de27cc1eeb741f6156e6843,{},),jsx(Link_ec2de69561b1ab953dc86ec312634bc4,{},))))))),jsx("div",{className:"col-span-1 md:col-span-2 lg:col-span-1"},jsx("div",{className:"bg-gray-50 p-5 rounded-xl border border-gray-200"},jsx("h3",{className:"text-lg font-bold text-gray-900 mb-3"},"Circle Members"),jsx(Div_51121faee8618d75303c35685bfc049f,{},))),jsx("div",{className:"col-span-1 md:col-span-2 lg:col-span-1"},jsx("div",{},jsx("h3",{className:"text-lg font-bold text-gray-900 mb-3"},"Circle Insights"),jsx("div",{className:"bg-gray-50 p-5 rounded-xl border border-gray-200"},jsx("div",{className:"bg-white p-4 rounded-xl border border-gray-100 mb-3"},jsx("span",{className:"text-xs text-gray-500 uppercase font-semibold"},"Avg Compatibility"),jsx("div",{},jsx(Span_cf4d7c2bcd8cb002d355384e51b8b7c8,{},),jsx("div",{className:"h-2 w-full bg-gray-100 rounded-full mt-1 overflow-hidden"},jsx(Div_bc5f164136a8d7024060c900ab939edc,{},)))),jsx("div",{className:"bg-white p-4 rounded-xl border border-gray-100 mb-3"},jsx("span",{className:"text-xs text-gray-500 uppercase font-semibold block mb-2"},"Common Strengths"),jsx(Fragment_81212ff9beb7f505091f700b41b92eb5,{},)),jsx("div",{className:"bg-white p-4 rounded-xl border border-gray-100"},jsx("span",{className:"text-xs text-gray-500 uppercase font-semibold block mb-2"},"Shared Availability"),jsx(Fragment_d171f9f3b354fdc12c22bf603f2bdc0b,{},))))))))):(jsx(Fragment,{},jsx("div",{className:"flex flex-col items-center justify-center h-[60vh]"},jsx(RadixThemesSpinner,{size:"3"},),jsx("p",{className:"mt-4 text-gray-500"},"Loading circle data..."))))))
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
    jsx(Fragment,{},jsx("div",{className:"flex w-full min-h-screen bg-gray-50"},jsx("div",{},jsx(Div_c1f3c749b807c06ffcf591c756121421,{},),jsx(Aside_06c0acd7e6bdf09e1f3254efc9bcd432,{},)),jsx(Aside_1ef380eabec6f8bf6ae3f4d1a32f6e09,{},),jsx("div",{className:"flex-1 flex flex-col min-w-0"},jsx("header",{className:"md:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30"},jsx(Button_0d8d7a023769a6649a4c5923bdbd66e6,{},),jsx(ReactRouterLink,{className:"text-lg font-bold text-indigo-600 hover:opacity-80 transition-opacity",to:"/landing"},"Meshflow")),jsx("main",{className:"flex-1 bg-gray-50 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-auto transition-all duration-300"},jsx("div",{className:"p-8"},jsx(Fragment_ebe5ecb93932bc0b6913af8574ad8477,{},)))),jsx(Button_5c3b3b0b916bef960265a28869919bde,{},)),jsx("title",{},"App | Groups"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}