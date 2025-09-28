import React from 'react';
import { FooterFrame } from '../shared/FooterFrame';
import { Layers2Icon, MenuIcon, SquareMenuIcon } from 'lucide-react';
import { TooltipButton } from '../shared/TooltipButton';
import { useAtom, useAtomValue } from 'jotai';
import { activeFaceAtom, cubeColorAtom, lightThemeAtom } from '@/atoms/atomStore';

export const Pages = () => {
    const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
    const theme = useAtomValue(lightThemeAtom);
    const backgroundColor = useAtomValue(cubeColorAtom);

    return (
        <FooterFrame>
            <TooltipButton
                    tooltip={true}
                    inputIcon={<SquareMenuIcon color={backgroundColor} />}
                    tooltipText={"Pages"}
                    // handleClick={() => setActiveFace()}
                    state={theme}
                    round={true}
                    size={8}
                />
        </FooterFrame>
    )
}
