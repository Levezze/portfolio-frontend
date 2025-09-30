import React from 'react';
import { StateControls } from './StateControls';
import { Navigation } from './Navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAtomValue } from 'jotai';
import { cubeColorAtom } from '@/atoms/atomStore';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

export const Footer = () => {
    const isMobile = useIsMobile();
    const cubeColor = useAtomValue(cubeColorAtom);

    // Desktop/Tablet: Fixed footer
    if (!isMobile) {
        return (
            <div className='footer fixed bottom-5 z-100 gap-4 flex flex-row justify-between'>
                <Navigation variant="default" />
                <StateControls variant="default" />
            </div>
        );
    }

    // Mobile: Drawer
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-100 rounded-full"
                    variant="outline"
                    size="icon"
                >
                    <MenuIcon className="h-5 w-5" />
                </Button>
            </DrawerTrigger>
            <DrawerContent style={{ backgroundColor: cubeColor || '#A8DADC' }}>
                <DrawerHeader>
                    <DrawerTitle className="text-foreground">Menu</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-6">
                    <Navigation variant="mobile" />
                    <StateControls variant="mobile" />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
