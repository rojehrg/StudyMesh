import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,getRefValue,getRefValues} from "$/utils/state"
import {Link as ReactRouterLink} from "react-router"
import {Mail as LucideMail} from "lucide-react"
import {jsx} from "@emotion/react"




function Link_109de1cad98b5f1f8b3c73b6a8a6b3fb () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx(ReactRouterLink,{className:"w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center mb-4 no-underline cursor-pointer",target:"_self",to:reflex___state____state__app___states___auth_state____auth_state.google_oauth_url_rx_state_},jsx(LucideMail,{className:"w-5 h-5 mr-2"},),"Sign up with Google")
  )
}


function Button_40e802f00541339202711cf6a6411acc () {
  const reflex___state____state__app___states___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___states___auth_state____auth_state)



  return (
    jsx("button",{className:"w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed",disabled:reflex___state____state__app___states___auth_state____auth_state.is_authenticating_rx_state_,type:"submit"},(reflex___state____state__app___states___auth_state____auth_state.is_authenticating_rx_state_ ? "Creating Account..." : "Create Account"))
  )
}


function Form_a3eaf73e89e8ea2ebbc000d1eeaabc46 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_cee973c83c27f07e1648c6982852ec32 = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("reflex___state____state.app___states___auth_state____auth_state.signup", ({ ["form_data"] : form_data }), ({  })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx("form",{className:"w-full",onSubmit:handleSubmit_cee973c83c27f07e1648c6982852ec32},jsx("div",{className:"w-full mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Full Name"),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"name",placeholder:"Jordan Rivera",required:true,type:"text"},)),jsx("div",{className:"w-full mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Work Email"),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"email",placeholder:"you@company.com",required:true,type:"email"},)),jsx("div",{className:"w-full mb-4"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Password"),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"password",placeholder:"Create a password",required:true,type:"password"},)),jsx("div",{className:"w-full mb-6"},jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1"},"Confirm Password"),jsx("input",{className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all",name:"confirm_password",placeholder:"Confirm your password",required:true,type:"password"},)),jsx("div",{className:"w-full"},jsx("div",{className:"flex items-center my-6"},jsx("div",{className:"flex-1 border-t border-gray-300"},),jsx("span",{className:"px-4 text-sm text-gray-500"},"OR"),jsx("div",{className:"flex-1 border-t border-gray-300"},)),jsx(Link_109de1cad98b5f1f8b3c73b6a8a6b3fb,{},)),jsx(Button_40e802f00541339202711cf6a6411acc,{},),jsx("div",{className:"mt-6 text-center text-sm text-gray-600"},"Already have an account? ",jsx(ReactRouterLink,{className:"text-indigo-600 font-semibold hover:underline",to:"/login"},"Sign in")))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx("div",{className:"w-full min-h-screen font-['Inter']"},jsx("div",{className:"flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 px-4"},jsx("div",{className:"bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center border border-gray-100"},jsx("h1",{className:"text-3xl font-bold text-indigo-600 mb-2"},"Meshflow"),jsx("p",{className:"text-gray-500 text-center mb-8"},"Empower teams to share expertise and close enablement gaps."),jsx("div",{className:"w-full flex flex-col items-center"},jsx("h2",{className:"text-xl font-semibold text-gray-800 mb-6"},"Create Account"),jsx(Form_a3eaf73e89e8ea2ebbc000d1eeaabc46,{},))))),jsx("title",{},"App | Signup"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}