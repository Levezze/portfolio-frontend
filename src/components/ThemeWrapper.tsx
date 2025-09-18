'use client'
import { useSetAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { lightThemeAtom, cubeBackgroundColorAtom, pageColorAtom, activeFaceAtom } from '@/atoms/atomStore';
import { getCssColor } from '@/lib/utils';

export const ThemeWrapper = ({ children }:{ children: React.ReactNode }) => {
    const theme = useAtomValue(lightThemeAtom);
    const activeFace = useAtomValue(activeFaceAtom);
    const setCubeBgColor = useSetAtom(cubeBackgroundColorAtom);
    const setPageColor = useSetAtom(pageColorAtom);

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

    // background gradient change
    useEffect(() => {
        const pageColor = getCssColor(`--page-${activeFace}`);
        if (pageColor) {
            setPageColor(pageColor);
        }
    }, [activeFace, setPageColor]);

    return (
        <>{children}</>
    )
}
