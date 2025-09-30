'use client';
import { useSetAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { lightThemeAtom, cubeColorAtom, pageColorAtom, activeFaceAtom } from '@/atoms/atomStore';
import { getCssColor } from '@/utils/general';

export const ThemeWrapper = ({ children }:{ children: React.ReactNode }) => {
    const theme = useAtomValue(lightThemeAtom);
    const activeFace = useAtomValue(activeFaceAtom);
    const setCubeBgColor = useSetAtom(cubeColorAtom);
    const setPageColor = useSetAtom(pageColorAtom);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by waiting for mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // Don't manipulate DOM until after hydration

        const initialColor = getCssColor('--background');
        if (initialColor) {
            setCubeBgColor(initialColor);
        }
    }, [mounted, setCubeBgColor]);

    useEffect(() => {
        if (!mounted) return; // Don't manipulate DOM until after hydration

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
    }, [mounted, theme, setCubeBgColor]);

    // background gradient change
    useEffect(() => {
        if (!mounted) return; // Don't manipulate DOM until after hydration

        const pageColor = getCssColor(`--page-${activeFace}`);
        if (pageColor) {
            setPageColor(pageColor);
        }
    }, [mounted, activeFace, setPageColor]);

    return (
        <>{children}</>
    )
}
