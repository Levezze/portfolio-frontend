import React from 'react';
import { HeaderButton } from './shared/HeaderButton';
import { TooltipButton } from './shared/TooltipButton';

export const Header = () => {
  return (
    <div className='header fixed top-5 z-20 w-full max-w-[800px] flex flex-row justify-around'>
        <HeaderButton buttonText='Chat' navigate='chat' />
        <HeaderButton buttonText='About' navigate='about' />
        <HeaderButton buttonText='Projects' navigate='projects' />
        <HeaderButton buttonText='Contact' navigate='contact' />
        <HeaderButton buttonText='Resume' navigate='resume' />
    </div>
  )
}
