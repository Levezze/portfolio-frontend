import React from 'react';
import { ConstructionIcon } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { lightThemeAtom } from '@/atoms/atomStore';

export const Maintenance = () => {
    const theme = useAtomValue(lightThemeAtom);
    const borderColor = theme ? 'border-background' : 'border-white';
    return (
        <div className={`gap-2 flex flex-col items-center justify-center p-8 z-100 border rounded-full`}>
            <ConstructionIcon className="w-4 h-4 color-muted-foreground" />
            Down for maintenance, will be back shortly!
        </div>
    )
}
