import { activeFaceAtom } from "@/atoms/atomStore";
import { makeAssistantToolUI, useThreadRuntime } from "@assistant-ui/react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { capitalFirstLetter } from "@/lib/utils";
import { type PagesType } from "@/lib/api/schemas/tools";

export const NavigationToolUI = makeAssistantToolUI<{ page: PagesType }, unknown>({
    toolName: 'navigate_page',
    render: ({ args, result, status }) => {
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG) {
            console.log('🟢 NavigationToolUI rendering with:', { args, result, status });
        }
        const setActiveFace = useSetAtom(activeFaceAtom);
        useEffect(() => {
            setActiveFace(args.page);
        }, [args.page]);

        return <span>{`Taking you to the ${capitalFirstLetter(args.page)} page`}</span>
    }
})
