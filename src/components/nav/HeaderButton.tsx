import React from 'react';
import { useSetAtom } from 'jotai';
import { activeFaceAtom } from '@/atoms/atomStore';
import { type BoxFaces } from '@/types/atomTypes';

export const HeaderButton = ({ 
    buttonText,
    navigate,
}: { buttonText: string, navigate: BoxFaces }) => {
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
