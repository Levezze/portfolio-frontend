'use client'
import { useSetAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { lightThemeAtom, cubeBackgroundColor } from '@/atoms/atomStore';
import { getCssColor } from '@/lib/utils';

export const ThemeWrapper = ({ children }:{ children: React.ReactNode }) => {
    const theme = useAtomValue(lightThemeAtom);
    const setCubeBgColor = useSetAtom(cubeBackgroundColor);

    useEffect(() => {
        const initialColor = getCssColor('--background');
        if (initialColor) {
            setCubeBgColor(initialColor);
        }
    }, []);

    useEffect(() => {
        const htmlClass = document.documentElement.classList;
        if (theme) {
            htmlClass.remove('dark');
        } else {
            htmlClass.add('dark');
        }

        setTimeout(() => {
            const color = getCssColor('--background');
            if (color) {
                setCubeBgColor(color);
            }
        }, 0);
    }, [theme, setCubeBgColor]);

    return (
        <>{children}</>
    )
}
