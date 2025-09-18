'use client'
import { useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { lightThemeAtom } from '@/atoms/atomStore';

export const ThemeWrapper = ({ children }:{ children: React.ReactNode }) => {
    const theme = useAtomValue(lightThemeAtom);
    
    useEffect(() => {
        const htmlClass = document.documentElement.classList;
        if (theme) {
            htmlClass.add('dark');
        } else {
            htmlClass.remove('dark');
        }
    }, [theme]);

    return (
        <>{children}</>
    )
}
