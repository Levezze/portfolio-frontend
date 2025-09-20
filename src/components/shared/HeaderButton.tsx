import React from 'react';
import { useSetAtom } from 'jotai';
import { activeFaceAtom } from '@/atoms/atomStore';
import { type PagesType } from '@/lib/api/schemas/tools';

export const HeaderButton = ({ 
    buttonText,
    navigate,
}: { buttonText: string, navigate: PagesType }) => {
    const setActiveFace = useSetAtom(activeFaceAtom);

    const handleClick = () => {
        setActiveFace(navigate)
    }

    return (
        <button 
            className='flex text-md cursor-pointer text-opacity-50 header-button'
            onClick={handleClick}
        >
            {buttonText}
        </button>
    )
}
