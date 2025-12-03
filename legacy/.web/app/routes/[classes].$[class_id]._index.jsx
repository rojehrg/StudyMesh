import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,getRefValue,getRefValues,isNotNullOrUndefined,isTrue} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {Bell as LucideBell,BellOff as LucideBellOff,BookOpen as LucideBookOpen,ChevronLeft as LucideChevronLeft,CirclePlus as LucideCirclePlus,Hand as LucideHand,Info as LucideInfo,LayoutDashboard as LucideLayoutDashboard,LogIn as LucideLogIn,LogOut as LucideLogOut,Menu as LucideMenu,RefreshCw as LucideRefreshCw,Settings as LucideSettings,Sparkles as LucideSparkles,Trash2 as LucideTrash2,Users as LucideUsers,X as LucideX} from "lucide-react"
import {Close as RadixPrimitiveDialogClose,Content as RadixPrimitiveDialogContent,Overlay as RadixPrimitiveDialogOverlay,Portal as RadixPrimitiveDialogPortal,Root as RadixPrimitiveDialogRoot,Title as RadixPrimitiveDialogTitle} from "@radix-ui/react-dialog"
import {Box as RadixThemesBox,Spinner as RadixThemesSpinner,Tabs as RadixThemesTabs} from "@radix-ui/themes"
import {Background,Controls,ReactFlow} from "@xyflow/react"
import {StudentNode} from "$/utils/components"
import {jsx} from "@emotion/react"
import "@xyflow/react/dist/style.css"




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


function Title_936ee90ae42ca3dbcc8dda45e2931da6 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(RadixPrimitiveDialogTitle,{className:"text-xl font-bold text-gray-900"},reflex___state____state__app___states___class_state____class_state.selected_student_details_rx_state_?.["name"])
  )
}


function P_1e69546d406a60e26fbd19a3861ba08e () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("p",{className:"text-sm font-medium text-gray-900"},reflex___state____state__app___states___class_state____class_state.selected_student_details_rx_state_?.["study_style"])
  )
}


function P_f9c28e9dea3845d41e3c967dc1c81003 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("p",{className:"text-sm font-medium text-gray-900"},reflex___state____state__app___states___class_state____class_state.selected_student_details_rx_state_?.["goals"])
  )
}


function P_54f331a42fe449a5eea2104f0eb86b6f () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("p",{className:"text-sm text-gray-700"},reflex___state____state__app___states___class_state____class_state.selected_student_details_rx_state_?.["strengths"])
  )
}


function P_d1aa702abf1fab29ac6c263bf7276767 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("p",{className:"text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg"},reflex___state____state__app___states___class_state____class_state.selected_student_details_rx_state_?.["bio"])
  )
}


function Root_187682a37facc1c96993398d063ff2b7 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_open_change_dc3f56d67cd197381a8e868699ab76c5 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_show_student_modal", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixPrimitiveDialogRoot,{onOpenChange:on_open_change_dc3f56d67cd197381a8e868699ab76c5,open:reflex___state____state__app___states___class_state____class_state.show_student_modal_rx_state_},jsx(RadixPrimitiveDialogPortal,{},jsx(RadixPrimitiveDialogOverlay,{className:"fixed inset-0 bg-black/50 backdrop-blur-sm z-50"},),jsx(RadixPrimitiveDialogContent,{className:"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-50"},jsx("div",{className:"flex justify-between items-start mb-4 border-b pb-2"},jsx(Title_936ee90ae42ca3dbcc8dda45e2931da6,{},),jsx(RadixPrimitiveDialogClose,{},jsx("button",{className:"text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"},jsx(LucideX,{className:"w-5 h-5"},)))),jsx("div",{className:"space-y-2"},jsx("div",{className:"mb-3"},jsx("span",{className:"text-xs font-semibold text-gray-500 uppercase tracking-wider"},"Expertise area"),jsx(P_1e69546d406a60e26fbd19a3861ba08e,{},)),jsx("div",{className:"mb-3"},jsx("span",{className:"text-xs font-semibold text-gray-500 uppercase tracking-wider"},"Engagement objective"),jsx(P_f9c28e9dea3845d41e3c967dc1c81003,{},)),jsx("div",{className:"mb-3"},jsx("span",{className:"text-xs font-semibold text-gray-500 uppercase tracking-wider"},"Capabilities"),jsx(P_54f331a42fe449a5eea2104f0eb86b6f,{},)),jsx("div",{},jsx("span",{className:"text-xs font-semibold text-gray-500 uppercase tracking-wider"},"Background"),jsx(P_d1aa702abf1fab29ac6c263bf7276767,{},))),jsx("div",{},jsx(RadixPrimitiveDialogClose,{},jsx("button",{className:"w-full mt-6 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"},"Close"))))))
  )
}


function Div_045ea4622ab2e8babe984af8d5f5abda () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_cb378e098e13354631efcebd1aee8f95 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_show_offer_modal", ({ ["show"] : false }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("div",{className:"fixed inset-0 bg-black/50 z-50",onClick:on_click_cb378e098e13354631efcebd1aee8f95},)
  )
}


function H3_1bf5e0bfe95215fcadeab1d37c13ec9d () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("h3",{className:"text-xl font-bold text-gray-900 mb-2"},("Offer Support to "+reflex___state____state__app___states___class_state____class_state.offer_recipient_name_rx_state_))
  )
}


function Input_13f3705b6a826388c5aa24e68cc60dec () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_f7b9a6ce9b29d8f5b622d259fa7433ca = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_skill", ({ ["skill"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",defaultValue:reflex___state____state__app___states___class_state____class_state.offer_skill_rx_state_,onChange:on_change_f7b9a6ce9b29d8f5b622d259fa7433ca,placeholder:"e.g. Product Launch Kits, Process Automation"},)
  )
}


function Input_8da69e678c830320664a2d7865eeebb2 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_f9fb7dc6fcb838760075205de4c9cf74 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_meeting_type", ({ ["meeting_type"] : "zoom" }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{checked:(reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "zoom"?.valueOf?.()),className:"mr-2",name:"meeting_type",onChange:on_change_f9fb7dc6fcb838760075205de4c9cf74,type:"radio",value:(isNotNullOrUndefined("zoom") ? "zoom" : "")},)
  )
}


function Input_e24ba2456d685640667be2417ce4adb4 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_5cec2c59397ac7f3b427e480bc9e7592 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_meeting_type", ({ ["meeting_type"] : "office" }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{checked:(reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "office"?.valueOf?.()),className:"mr-2",name:"meeting_type",onChange:on_change_5cec2c59397ac7f3b427e480bc9e7592,type:"radio",value:(isNotNullOrUndefined("office") ? "office" : "")},)
  )
}


function Input_d2a2fc1a33ac226d856f19e5777eee28 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_d091b6a73eacbe3c1eb4e7a85413d96d = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_meeting_type", ({ ["meeting_type"] : "hybrid" }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{checked:(reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "hybrid"?.valueOf?.()),className:"mr-2",name:"meeting_type",onChange:on_change_d091b6a73eacbe3c1eb4e7a85413d96d,type:"radio",value:(isNotNullOrUndefined("hybrid") ? "hybrid" : "")},)
  )
}


function Input_1ded45864b30f1accf4a8e80fbaa7af9 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_0e7e2ad3d4499b4eab080598d734ad94 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_zoom_link", ({ ["link"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",defaultValue:reflex___state____state__app___states___class_state____class_state.offer_zoom_link_rx_state_,onChange:on_change_0e7e2ad3d4499b4eab080598d734ad94,placeholder:"https://zoom.us/j/123456789"},)
  )
}


function Fragment_58d9a095e623ad581157dec3cd8d72a4 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(((reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "zoom"?.valueOf?.()) || (reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "hybrid"?.valueOf?.()))?(jsx(Fragment,{},jsx("div",{className:"mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Zoom Link"),jsx(Input_1ded45864b30f1accf4a8e80fbaa7af9,{},)))):(jsx(Fragment,{},))))
  )
}


function Input_591a2feb66c604406ab797b1ada1bc89 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_f0b7243943fd42c707e74212f695f2cf = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_office_building", ({ ["building"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",defaultValue:reflex___state____state__app___states___class_state____class_state.offer_office_building_rx_state_,onChange:on_change_f0b7243943fd42c707e74212f695f2cf,placeholder:"e.g. Main Office, Building A"},)
  )
}


function Input_1db55fe945bce582d458f73f4ca94fc4 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_74be8fa0c0bd554689b5b597f3e7b684 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_offer_office_room", ({ ["room"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("input",{className:"w-full px-3 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none",defaultValue:reflex___state____state__app___states___class_state____class_state.offer_office_room_rx_state_,onChange:on_change_74be8fa0c0bd554689b5b597f3e7b684,placeholder:"e.g. Conference Room 3B, Desk 42"},)
  )
}


function Fragment_48c0c5ff17874ea93fb18b4850e59c30 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(((reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "office"?.valueOf?.()) || (reflex___state____state__app___states___class_state____class_state.offer_meeting_type_rx_state_?.valueOf?.() === "hybrid"?.valueOf?.()))?(jsx(Fragment,{},jsx("div",{},jsx("div",{className:"mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Building"),jsx(Input_591a2feb66c604406ab797b1ada1bc89,{},)),jsx("div",{className:"mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Room"),jsx(Input_1db55fe945bce582d458f73f4ca94fc4,{},))))):(jsx(Fragment,{},))))
  )
}


function Button_586c7bc2bb510e3f6a70c0c1529daa52 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_cb378e098e13354631efcebd1aee8f95 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.set_show_offer_modal", ({ ["show"] : false }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium mr-3",onClick:on_click_cb378e098e13354631efcebd1aee8f95,type:"button"},"Cancel")
  )
}


function Button_a3ddd1b7c6be5a4b4c87136ef9b502f3 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_35b6fdeb1ad7458cccc4963b47cbdee2 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.create_support_offer", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium",onClick:on_click_35b6fdeb1ad7458cccc4963b47cbdee2,type:"submit"},"Send Offer")
  )
}


function Form_cc55e49b7be498fa9754eaae03c7fc8b () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_42be313e944f89c6920cf660f0fd0648 = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("_call_function", ({ ["function"] : (() => null), ["callback"] : null }), ({ ["preventDefault"] : true })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx("form",{className:"w-full",onSubmit:handleSubmit_42be313e944f89c6920cf660f0fd0648},jsx("div",{className:"mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Skill/Area You're Offering"),jsx(Input_13f3705b6a826388c5aa24e68cc60dec,{},)),jsx("div",{className:"mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2"},"Meeting Type"),jsx("div",{className:"flex flex-col gap-2"},jsx("label",{className:"flex items-center cursor-pointer"},jsx(Input_8da69e678c830320664a2d7865eeebb2,{},),"Zoom / Virtual"),jsx("label",{className:"flex items-center cursor-pointer"},jsx(Input_e24ba2456d685640667be2417ce4adb4,{},),"In-Office"),jsx("label",{className:"flex items-center cursor-pointer"},jsx(Input_d2a2fc1a33ac226d856f19e5777eee28,{},),"Hybrid"))),jsx(Fragment_58d9a095e623ad581157dec3cd8d72a4,{},),jsx(Fragment_48c0c5ff17874ea93fb18b4850e59c30,{},),jsx("div",{className:"flex justify-end mt-6"},jsx(Button_586c7bc2bb510e3f6a70c0c1529daa52,{},),jsx(Button_a3ddd1b7c6be5a4b4c87136ef9b502f3,{},)))
  )
}


function Fragment_b6a5a5031ea64e0047e475384ac03d4a () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___states___class_state____class_state.show_offer_modal_rx_state_?(jsx(Fragment,{},jsx("div",{},jsx(Div_045ea4622ab2e8babe984af8d5f5abda,{},),jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4"},jsx("div",{className:"bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"},jsx("div",{className:"p-6"},jsx(H3_1bf5e0bfe95215fcadeab1d37c13ec9d,{},),jsx("p",{className:"text-sm text-gray-600 mb-6"},"Add meeting details so they can easily connect with you."),jsx(Form_cc55e49b7be498fa9754eaae03c7fc8b,{},))))))):(jsx(Fragment,{},))))
  )
}


function H1_2b34be3157b1eb22571aba2a8d308097 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("h1",{className:"text-2xl font-bold text-gray-900"},reflex___state____state__app___states___class_state____class_state.current_class_rx_state_?.["class_name"])
  )
}


function Span_5b2c7d12e6508dae52adb9af3626582c () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("span",{className:"font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold border border-indigo-100"},reflex___state____state__app___states___class_state____class_state.current_class_rx_state_?.["class_code"])
  )
}


function Span_d84b05d47f38c274ece63932ca2d5874 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx("span",{className:"text-gray-500 text-sm"},("\u2022 "+reflex___state____state__app___states___class_state____class_state.current_class_rx_state_?.["school"]))
  )
}


function Button_faf719bae778d871e74184c0e8045a7e () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_54a001cbb105c254d6aa49d27e045658 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.calculate_class_matches", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors",disabled:reflex___state____state__app___states___class_state____class_state.is_calculating_matches_rx_state_,onClick:on_click_54a001cbb105c254d6aa49d27e045658,title:"Refresh Data"},jsx(LucideRefreshCw,{className:"w-4 h-4"},))
  )
}


function Button_42162de56e0867dcfb1aaaac018c5b36 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_a9733e24dc27bb2cebedd3247c5b2a53 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.delete_class", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2",onClick:on_click_a9733e24dc27bb2cebedd3247c5b2a53,title:"Archive Pod"},jsx(LucideTrash2,{className:"w-4 h-4"},))
  )
}


function Fragment_3212465883e99874ed2da10531c07706 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx(Fragment,{},((reflex___state____state__app___states___class_state____class_state.current_class_rx_state_?.["created_by"]?.valueOf?.() === reflex___state____state__app___states___auth_state____auth_state.user_id_rx_state_?.valueOf?.())?(jsx(Fragment,{},jsx("div",{className:"flex items-center"},jsx(Button_42162de56e0867dcfb1aaaac018c5b36,{},)))):(jsx(Fragment,{},))))
  )
}


function Reactflow_7caf00894ada4445e1b76b77077e0ed2 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_node_click_8ca534bcc75e773735ac6e06ebc5c6e0 = useCallback(((_event, _node) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.select_student", ({ ["node_id"] : ({ ["button"] : _event?.["button"], ["buttons"] : _event?.["buttons"], ["client_x"] : _event?.["clientX"], ["client_y"] : _event?.["clientY"], ["alt_key"] : _event?.["altKey"], ["ctrl_key"] : _event?.["ctrlKey"], ["meta_key"] : _event?.["metaKey"], ["shift_key"] : _event?.["shiftKey"] })?.["id"] }), ({  })))], [_event, _node], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(ReactFlow,{attributionPosition:"bottom-left",colorMode:"light",edges:reflex___state____state__app___states___class_state____class_state.graph_edges_rx_state_,fitView:true,maxZoom:2.0,minZoom:0.5,nodeTypes:({ ["studentNode"] : StudentNode }),nodes:reflex___state____state__app___states___class_state____class_state.graph_nodes_rx_state_,onNodeClick:on_node_click_8ca534bcc75e773735ac6e06ebc5c6e0},jsx(Background,{css:({ ["patternColor"] : "#e0e7ff" }),gap:20},),jsx(Controls,{showInteractive:false},))
  )
}


function Div_951ceffe3b241fe0e592d73fd4b81a04 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"space-y-3"},Array.prototype.map.call(reflex___state____state__app___states___class_state____class_state.recommended_partners_rx_state_ ?? [],((match_rx_state_,index_4f3254f06d79e58bd39904be7cd8e17c)=>(jsx("div",{className:"bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-200",key:index_4f3254f06d79e58bd39904be7cd8e17c},jsx("div",{className:"flex justify-between items-start mb-3"},jsx("div",{className:"flex items-center"},jsx("div",{className:"w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm"},match_rx_state_?.["partner_name"]?.at?.(0)),jsx("div",{className:"ml-3"},jsx("p",{className:"font-semibold text-gray-900 text-sm"},match_rx_state_?.["partner_name"]),jsx("p",{className:"text-xs text-indigo-600 font-medium"},(match_rx_state_?.["score"]+"% Compatible")))),jsx("button",{className:"p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.nudge_partner", ({ ["partner_id"] : match_rx_state_?.["partner_id"] }), ({  })))], [_e], ({  })))),title:"Nudge to connect"},jsx(LucideHand,{className:"w-4 h-4"},))),jsx(Fragment,{},(isTrue(match_rx_state_?.["match_reasons"])?(jsx(Fragment,{},jsx("div",{className:"flex gap-2 flex-wrap mb-2"},Array.prototype.map.call(match_rx_state_?.["match_reasons"] ?? [],((reason_rx_state_,index_fe447635cc8b6bb7a4431561d644b236)=>(jsx(Fragment,{key:index_fe447635cc8b6bb7a4431561d644b236},(reason_rx_state_.includes("Offer")?(jsx(Fragment,{},jsx("span",{className:"text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 font-medium"},reason_rx_state_))):(jsx(Fragment,{},(reason_rx_state_.includes("Ask")?(jsx(Fragment,{},jsx("span",{className:"text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 font-medium"},reason_rx_state_))):(jsx(Fragment,{},jsx("span",{className:"text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200 font-medium"},reason_rx_state_)))))))))))))):(jsx(Fragment,{},)))),jsx("div",{className:"flex gap-2 flex-wrap"},jsx("span",{className:"text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full"},("Gap Score: "+match_rx_state_?.["breakdown"]?.["skill_gap"])),jsx("span",{className:"text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full"},("Reliability: "+match_rx_state_?.["breakdown"]?.["reliability"]))))))))
  )
}


function Fragment_e0d37854f17c075567e0c45832569b5b () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___class_state____class_state.recommended_partners_rx_state_)?(jsx(Fragment,{},jsx(Div_951ceffe3b241fe0e592d73fd4b81a04,{},))):(jsx(Fragment,{},jsx("div",{className:"flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300"},jsx(LucideSparkles,{className:"w-12 h-12 text-gray-300 mb-2"},),jsx("p",{className:"text-gray-500 font-medium"},"No insights yet"))))))
  )
}


function Div_153c87eaa07b59ff0be1565c0b881444 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx("div",{className:"divide-y divide-gray-100"},Array.prototype.map.call(reflex___state____state__app___states___class_state____class_state.current_class_members_rx_state_ ?? [],((member_rx_state_,index_e11bde8576dd5f2a36c8616a4474c423)=>(jsx("div",{className:"flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors",key:index_e11bde8576dd5f2a36c8616a4474c423},jsx("div",{className:"flex items-center flex-1"},jsx("div",{className:"w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"},jsx("span",{className:"text-xs font-bold text-gray-600"},member_rx_state_?.["name"]?.at?.(0))),jsx("div",{className:"cursor-pointer hover:underline",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.select_student", ({ ["node_id"] : (JSON.stringify(member_rx_state_?.["id"])) }), ({  })))], [_e], ({  }))))},jsx("span",{className:"ml-3 text-sm font-medium text-gray-900"},member_rx_state_?.["name"]))),jsx("button",{className:"p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___states___class_state____class_state.nudge_user", ({ ["recipient_id"] : member_rx_state_?.["id"] }), ({  })))], [_e], ({  })))),title:"Nudge"},jsx(LucideHand,{className:"w-3 h-3"},)))))))
  )
}


function Fragment_fb9b8609c59238315daf6bb8d3667988 () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___class_state____class_state.current_class_members_rx_state_)?(jsx(Fragment,{},jsx(Div_153c87eaa07b59ff0be1565c0b881444,{},))):(jsx(Fragment,{},jsx("p",{className:"text-gray-500 text-sm text-center p-4"},"No members found.")))))
  )
}


function Div_c05f8590f20ca639d59076f2ecfde72e () {
  const reflex___state____state__app___states___notification_state____notification_state = useContext(StateContexts.reflex___state____state__app___states___notification_state____notification_state)



  return (
    jsx("div",{className:"space-y-2"},Array.prototype.map.call(reflex___state____state__app___states___notification_state____notification_state.notifications_rx_state_ ?? [],((notification_rx_state_,index_e66b99aae1088c88bee71ffac44f258a)=>(jsx("div",{className:"flex items-start p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors",key:index_e66b99aae1088c88bee71ffac44f258a},jsx("div",{className:"flex-shrink-0"},jsx(LucideBell,{className:"w-4 h-4 text-indigo-600 mt-1"},)),jsx("div",{className:"flex-1 ml-3"},jsx("p",{className:"text-sm text-gray-900"},notification_rx_state_?.["content"]),jsx("p",{className:"text-xs text-gray-500 mt-1"},notification_rx_state_?.["created_at"])),jsx(Fragment,{},(!(notification_rx_state_?.["read"])?(jsx(Fragment,{},jsx("div",{className:"w-2 h-2 bg-indigo-600 rounded-full"},))):(jsx(Fragment,{},)))))))))
  )
}


function Fragment_0061623425e88fcc8ce24deb70e174d8 () {
  const reflex___state____state__app___states___notification_state____notification_state = useContext(StateContexts.reflex___state____state__app___states___notification_state____notification_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___notification_state____notification_state.notifications_rx_state_)?(jsx(Fragment,{},jsx(Div_c05f8590f20ca639d59076f2ecfde72e,{},))):(jsx(Fragment,{},jsx("div",{className:"flex flex-col items-center justify-center h-48"},jsx(LucideBellOff,{className:"w-12 h-12 text-gray-300 mb-2"},),jsx("p",{className:"text-gray-500 font-medium"},"No recent activity"))))))
  )
}


function Fragment_70665378af827fb410798ef98d73905f () {
  const reflex___state____state__app___states___class_state____class_state = useContext(StateContexts.reflex___state____state__app___states___class_state____class_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___states___class_state____class_state.current_class_rx_state_)?(jsx(Fragment,{},jsx("div",{className:"space-y-6"},jsx("div",{className:"flex items-start justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6"},jsx("div",{className:"flex-1"},jsx(H1_2b34be3157b1eb22571aba2a8d308097,{},),jsx("div",{className:"flex items-center gap-2 mt-1"},jsx(Span_5b2c7d12e6508dae52adb9af3626582c,{},),jsx(Span_d84b05d47f38c274ece63932ca2d5874,{},))),jsx("div",{className:"flex items-center"},jsx(Button_faf719bae778d871e74184c0e8045a7e,{},),jsx(Fragment_3212465883e99874ed2da10531c07706,{},))),jsx("div",{className:"grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6"},jsx("div",{className:"bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full"},jsx("div",{className:"flex items-center p-4 border-b border-gray-100"},jsx("h2",{className:"font-semibold text-gray-900"},"Network Topology"),jsx("div",{className:"ml-auto"},jsx("span",{className:"text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"},"Interactive"))),jsx("div",{className:"h-[600px] w-full bg-gray-50 relative"},jsx(RadixThemesBox,{className:"w-full h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner"},jsx(Reactflow_7caf00894ada4445e1b76b77077e0ed2,{},)))),jsx("div",{className:"h-full flex flex-col"},jsx(RadixThemesTabs.Root,{className:"w-full h-full flex flex-col",css:({ ["&[data-orientation='vertical']"] : ({ ["display"] : "flex" }) }),defaultValue:"insights"},jsx(RadixThemesTabs.List,{className:"flex border-b border-gray-200 bg-white rounded-t-xl px-2",css:({ ["&[data-orientation='vertical']"] : ({ ["display"] : "block", ["boxShadow"] : "inset -1px 0 0 0 var(--gray-a5)" }) })},jsx(RadixThemesTabs.Trigger,{className:"flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%" }) }),value:"insights"},"Insights"),jsx(RadixThemesTabs.Trigger,{className:"flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%" }) }),value:"team"},"Team"),jsx(RadixThemesTabs.Trigger,{className:"flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 hover:text-gray-700 transition-all",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%" }) }),value:"activity"},"Activity")),jsx(RadixThemesTabs.Content,{className:"bg-white rounded-b-xl border border-t-0 border-gray-200",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%", ["margin"] : null }) }),value:"insights"},jsx("div",{className:"p-4 bg-gray-50/50 min-h-[600px]"},jsx(Fragment_e0d37854f17c075567e0c45832569b5b,{},))),jsx(RadixThemesTabs.Content,{className:"bg-white rounded-b-xl border border-t-0 border-gray-200",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%", ["margin"] : null }) }),value:"team"},jsx("div",{className:"p-4 min-h-[600px]"},jsx(Fragment_fb9b8609c59238315daf6bb8d3667988,{},))),jsx(RadixThemesTabs.Content,{className:"bg-white rounded-b-xl border border-t-0 border-gray-200",css:({ ["&[data-orientation='vertical']"] : ({ ["width"] : "100%", ["margin"] : null }) }),value:"activity"},jsx("div",{className:"p-4 bg-gray-50/50 min-h-[600px]"},jsx(Fragment_0061623425e88fcc8ce24deb70e174d8,{},))))))))):(jsx(Fragment,{},jsx("div",{className:"flex flex-col items-center justify-center h-[60vh]"},jsx(RadixThemesSpinner,{size:"3"},),jsx("p",{className:"mt-4 text-gray-500"},"Loading pod data..."))))))
  )
}


function Div_0d1fe5709cd43003b4a708464d572c7d () {
  const reflex___state____state__app___states___layout_state____layout_state = useContext(StateContexts.reflex___state____state__app___states___layout_state____layout_state)



  return (
    jsx("div",{className:(reflex___state____state__app___states___layout_state____layout_state.sidebar_collapsed_rx_state_ ? "p-8 max-w-[1600px] mx-auto w-full" : "p-8 max-w-[1800px] mx-auto")},jsx(Root_187682a37facc1c96993398d063ff2b7,{},),jsx(Fragment_b6a5a5031ea64e0047e475384ac03d4a,{},),jsx(Fragment_70665378af827fb410798ef98d73905f,{},))
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
    jsx(Fragment,{},jsx("div",{className:"flex w-full min-h-screen bg-gray-50"},jsx("div",{},jsx(Div_c1f3c749b807c06ffcf591c756121421,{},),jsx(Aside_06c0acd7e6bdf09e1f3254efc9bcd432,{},)),jsx(Aside_1ef380eabec6f8bf6ae3f4d1a32f6e09,{},),jsx("div",{className:"flex-1 flex flex-col min-w-0"},jsx("header",{className:"md:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30"},jsx(Button_0d8d7a023769a6649a4c5923bdbd66e6,{},),jsx(ReactRouterLink,{className:"text-lg font-bold text-indigo-600 hover:opacity-80 transition-opacity",to:"/landing"},"Meshflow")),jsx("main",{className:"flex-1 bg-gray-50 min-h-[calc(100vh-4rem)] md:min-h-screen overflow-auto transition-all duration-300"},jsx(Div_0d1fe5709cd43003b4a708464d572c7d,{},))),jsx(Button_5c3b3b0b916bef960265a28869919bde,{},)),jsx("title",{},"App | Classes"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}