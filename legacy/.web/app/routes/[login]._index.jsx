import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,getRefValue,getRefValues} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {Mail as LucideMail} from "lucide-react"
import {jsx} from "@emotion/react"




function Link_e103fe87e89f5b5656fa8e8704d58131 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx(ReactRouterLink,{className:"w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center mb-4 no-underline cursor-pointer",target:"_self",to:reflex___state____state__app___states___auth_state____auth_state.google_oauth_url_rx_state_},jsx(LucideMail,{className:"w-5 h-5 mr-2"},),"Sign in with Google")
  )
}


function Button_08c64a5a17ac2b5fc9f85c05e91d19f8 () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("button",{className:"w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed",disabled:reflex___state____state__app___states___auth_state____auth_state.is_authenticating_rx_state_,type:"submit"},(reflex___state____state__app___states___auth_state____auth_state.is_authenticating_rx_state_ ? "Signing in..." : "Sign In"))
  )
}


function Form_6ab2e28d9a9b3ca3c2e8060f5c15c07e () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_d2102d0708399520593ca4600bbf84a4 = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("reflex___state____state.app___states___auth_state____auth_state.login", ({ ["form_data"] : form_data }), ({  })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx("form",{className:"w-full",onSubmit:handleSubmit_d2102d0708399520593ca4600bbf84a4},jsx("div",{className:"w-full mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Work Email"),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"email",placeholder:"you@company.com",required:true,type:"email"},)),jsx("div",{className:"w-full mb-6"},jsx("div",{className:"flex justify-between items-center"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Password"),jsx(ReactRouterLink,{className:"text-xs text-indigo-600 hover:text-indigo-800",to:"#"},"Forgot password?")),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"password",placeholder:"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",required:true,type:"password"},)),jsx("div",{className:"w-full"},jsx("div",{className:"flex items-center my-6"},jsx("div",{className:"flex-1 border-t border-gray-300"},),jsx("span",{className:"px-4 text-sm text-gray-500"},"OR"),jsx("div",{className:"flex-1 border-t border-gray-300"},)),jsx(Link_e103fe87e89f5b5656fa8e8704d58131,{},)),jsx(Button_08c64a5a17ac2b5fc9f85c05e91d19f8,{},),jsx("div",{className:"mt-6 text-center text-sm text-gray-600"},"Don't have an account? ",jsx(ReactRouterLink,{className:"text-indigo-600 font-semibold hover:underline",to:"/signup"},"Sign up")))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx("div",{className:"w-full min-h-screen font-['Inter']"},jsx("div",{className:"flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 px-4"},jsx("div",{className:"bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center border border-gray-100"},jsx("h1",{className:"text-3xl font-bold text-indigo-600 mb-2"},"Meshflow"),jsx("p",{className:"text-gray-500 text-center mb-8"},"Empower teams to share expertise and close enablement gaps."),jsx("div",{className:"w-full flex flex-col items-center"},jsx("h2",{className:"text-xl font-semibold text-gray-800 mb-6"},"Welcome Back"),jsx(Form_6ab2e28d9a9b3ca3c2e8060f5c15c07e,{},))))),jsx("title",{},"App | Login"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}