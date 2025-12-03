import {Fragment,useCallback,useContext,useEffect,useRef} from "react"
import {Spinner as RadixThemesSpinner} from "@radix-ui/themes"
import {ReflexEvent,refs} from "$/utils/state"
import {EventLoopContext} from "$/utils/context"
import {jsx} from "@emotion/react"




function Button_cf2d1319b42fff407abe533b5bc13861 () {
  const ref_manual_check_btn = useRef(null); refs["ref_manual_check_btn"] = ref_manual_check_btn;
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_0d1adb3278af9c9884c8e298779fa80b = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "window.location.reload()", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("button",{className:"mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm",css:({ ["display"] : "none" }),id:"manual-check-btn",onClick:on_click_0d1adb3278af9c9884c8e298779fa80b,ref:ref_manual_check_btn},"Click here if not redirected")
  )
}


export default function Component() {
const ref_oauth_status_message = useRef(null); refs["ref_oauth_status_message"] = ref_oauth_status_message;
const ref_debug_info = useRef(null); refs["ref_debug_info"] = ref_debug_info;




  return (
    jsx(Fragment,{},jsx("div",{className:"flex flex-col items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm"},jsx("div",{className:"flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in"},jsx(RadixThemesSpinner,{className:"mb-4",size:"3"},),jsx("p",{className:"text-gray-600 font-medium text-lg",id:"oauth-status-message",ref:ref_oauth_status_message},"Securely logging you in..."),jsx("div",{className:"mt-4 text-xs text-gray-400 font-mono whitespace-pre-wrap max-w-lg overflow-hidden",css:({ ["display"] : "none" }),id:"debug-info",ref:ref_debug_info},""),jsx(Button_cf2d1319b42fff407abe533b5bc13861,{},))),jsx("title",{},"App | Callback"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}