import { activeFaceAtom } from "@/atoms/atomStore";
import { makeAssistantToolUI, useThreadRuntime } from "@assistant-ui/react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { capitalFirstLetter } from "@/lib/utils";

export const NavigationToolUI = makeAssistantToolUI({
    toolName: 'navigate_page',
    render: ({ args, result, status }) => {
        const setActiveFace = useSetAtom(activeFaceAtom);
        useEffect(() => {
            setActiveFace(args.page);
        }, [args.page]);

        console.log('result:', result);
        console.log('status:', status);

        return <span>{`Taking you to the ${capitalFirstLetter(args.page as string)} page`}</span>
    }
})
// export const ToolExecutor = () => {
//     const thread = useThreadRuntime();
//     const setActiveFace = useSetAtom(activeFaceAtom);

//     useEffect(() => {
//         const handleUpdate = () => {
//             const messages = thread.getState().messages;
//             const lastMessage = messages.at(-1);
    
//             if (lastMessage?.role === 'assistant') {
//                 const toolCalls = lastMessage?.content.filter(c => c.type === 'tool-call');
//                 toolCalls.forEach(toolCall => {
//                     switch (toolCall.toolName) {
//                         case 'navigate_page':
//                             setActiveFace(toolCall.args.page);
//                             break;
//                     }
//                 });
//             }
//         }

//         handleUpdate();
//         const unsubscribe = thread.subscribe(handleUpdate);

//         return () => {
//             unsubscribe();
//         }
//     }, []);

//     return null;
// }
