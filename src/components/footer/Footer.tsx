import React from 'react';
import { StateControls } from './StateControls';
import { Navigation } from './Navigation';

export const Footer = () => {

    return (
        <div className='footer fixed bottom-5 z-100 gap-4 flex flex-row justify-between'>
            <Navigation />
            <StateControls />
        </div>
    )
}
