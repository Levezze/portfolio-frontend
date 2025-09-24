import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { activeFaceAtom, pageTransitionManagerAtom } from '@/atoms/atomStore';
import { type PagesType } from '@/lib/api/schemas/tools';
import { Button } from '../ui/button';

export const HeaderButton = ({ 
    buttonText,
    navigate,
}: { buttonText: string, navigate: PagesType }) => {
    const setActiveFace = useSetAtom(activeFaceAtom);
    const setPageTransition = useSetAtom(pageTransitionManagerAtom);
    const handleClick = () => {
        setPageTransition(null);
        setActiveFace(navigate);
    }

    return (
        <Button 
            variant="link"
            className='flex text-md cursor-pointer text-opacity-50 header-button font-normal'
            onClick={handleClick}
        >
            <div className=''>
                {buttonText}

            </div>
        </Button>
    )
}
