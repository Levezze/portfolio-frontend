import React, { useState } from 'react';
import { FooterFrame } from '../shared/FooterFrame';
import { MessageSquareTextIcon, CircleUserIcon, FolderGit2Icon, MailIcon, FileUserIcon } from 'lucide-react';
import { TooltipButton } from '../shared/TooltipButton';
import { useAtom, useAtomValue } from 'jotai';
import { activeFaceAtom, cubeColorAtom } from '@/atoms/atomStore';

export const Navigation = () => {
    const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
    const backgroundColor = useAtomValue(cubeColorAtom);

    return (
        <FooterFrame>
            <TooltipButton
                tooltip={activeFace === 'chat' ? false : true}
                disabled={activeFace === 'chat'}
                inputIcon={<MessageSquareTextIcon 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }}
                />}
                tooltipText={activeFace !== 'chat' ? "Open Chat" : ''}
                handleClick={() => setActiveFace('chat')}
                state={true}
                round={true}
                size={10}
            /> 
            <TooltipButton
                tooltip={activeFace === 'about' ? false : true}
                disabled={activeFace === 'about'}
                inputIcon={<CircleUserIcon 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }}
                />}
                tooltipText={"About"}
                handleClick={() => setActiveFace('about')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'projects' ? false : true}
                disabled={activeFace === 'projects'}
                inputIcon={<FolderGit2Icon 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }}
                />}
                tooltipText={"Projects"}
                handleClick={() => setActiveFace('projects')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'contact' ? false : true}
                disabled={activeFace === 'contact'}
                inputIcon={<MailIcon 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }}
                />}
                tooltipText={"Contact"}
                handleClick={() => setActiveFace('contact')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'resume' ? false : true}
                disabled={activeFace === 'resume'}
                inputIcon={<FileUserIcon 
                    color={backgroundColor} 
                    style={{ width: '18px', height: '18px' }}
                />}
                tooltipText={"Resume"}
                handleClick={() => setActiveFace('resume')}
                state={true}
                round={true}
                size={10}
            />
        </FooterFrame>
    )
}
