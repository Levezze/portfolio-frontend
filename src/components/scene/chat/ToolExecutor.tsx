import { activeFaceAtom } from "@/atoms/atomStore";
import { makeAssistantToolUI, useThreadRuntime } from "@assistant-ui/react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { capitalFirstLetter } from "@/lib/utils";
import { type PagesType } from "@/lib/api/schemas/tools";

export const NavigationToolUI = makeAssistantToolUI<{ page: PagesType }, unknown>({
    toolName: 'navigate_page',
    render: ({ args, result, status }) => {
        const setActiveFace = useSetAtom(activeFaceAtom);
        useEffect(() => {
            setActiveFace(args.page);
        }, [args.page]);

        console.log('result:', result);
        console.log('status:', status);

        return <span>{`Taking you to the ${capitalFirstLetter(args.page)} page`}</span>
    }
})
