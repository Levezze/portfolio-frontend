import React from 'react';
import { StateControls } from './StateControls';
import { Pages } from './Pages';

export const Footer = () => {

    return (
        <div className='footer fixed bottom-5 z-100 gap-4 flex flex-row justify-between'>
            <Pages />
            <StateControls />
        </div>
    )
}
