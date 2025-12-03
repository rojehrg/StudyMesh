
import {Fragment,memo,useContext,useEffect,useState} from "react"
import {ReflexEvent,getBackendURL,isTrue,refs} from "$/utils/state"
import {Handle} from "@xyflow/react"
import {User as LucideUser,WifiOff as LucideWifiOff} from "lucide-react"
import {jsx,keyframes} from "@emotion/react"
import {Toaster,toast} from "sonner"
import {ColorModeContext,EventLoopContext} from "$/utils/context"
import env from "$/env.json"






export const StudentNode = memo(({ data:dataRxMemo,isConnectable:isConnectableRxMemo }) => {
    



    return(
        jsx("div",{className:"flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform"},jsx(Handle,{className:"opacity-0",isConnectable:isConnectableRxMemo,position:"top",type:"target"},),jsx(Handle,{className:"opacity-0",isConnectable:isConnectableRxMemo,position:"bottom",type:"source"},),jsx("div",{className:"w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-md border-2 border-white ring-1 ring-gray-100",css:({ ["backgroundColor"] : dataRxMemo?.["color"] })},jsx(LucideUser,{className:"w-5 h-5 text-gray-700"},)),jsx("span",{className:"text-[10px] font-bold text-gray-700 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-gray-100 whitespace-nowrap max-w-[120px] truncate text-center"},dataRxMemo?.["label"]))
    )
});

export const MemoizedToastProvider = memo(({  }) => {
    const { resolvedColorMode } = useContext(ColorModeContext)
refs['__toast'] = toast


    return(
        jsx(Toaster,{closeButton:false,expand:true,position:"bottom-right",richColors:true,theme:resolvedColorMode},)
    )
});

export const DefaultOverlayComponents = memo(({  }) => {
    
const [addEvents, connectErrors] = useContext(EventLoopContext);
const toast = refs['__toast'];
const toast_props = ({ ["description"] : ("Check if server is reachable at "+getBackendURL(env.EVENT).href), ["closeButton"] : true, ["duration"] : 120000, ["id"] : "websocket-error" });
const [userDismissed, setUserDismissed] = useState(false);
const [waitedForBackend, setWaitedForBackend] = useState(false);
(useEffect(
() => {
    if ((connectErrors.length >= 2)) {
        if (!userDismissed) {
            toast?.error(("Cannot connect to server: "+((connectErrors.length > 0) ? connectErrors[connectErrors.length - 1].message : '')+"."), {...toast_props, onDismiss: () => setUserDismissed(true)},)
        }
    } else {
        toast?.dismiss("websocket-error");
        setUserDismissed(false);  // after reconnection reset dismissed state
    }
}
, [connectErrors, waitedForBackend]))


    return(
        jsx(Fragment,{},jsx("div",{css:({ ["position"] : "fixed", ["width"] : "100vw", ["height"] : "0" }),title:("Connection Error: "+((connectErrors.length > 0) ? connectErrors[connectErrors.length - 1].message : ''))},jsx(Fragment,{},((connectErrors.length > 0)?(jsx(Fragment,{},jsx(LucideWifiOff,{css:({ ["color"] : "crimson", ["zIndex"] : 9999, ["position"] : "fixed", ["bottom"] : "33px", ["right"] : "33px", ["animation"] : (keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })+" 1s infinite") }),size:32},))):(jsx(Fragment,{},))))),jsx(Fragment,{},))
    )
});
