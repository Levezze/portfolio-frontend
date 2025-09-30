import React, { useState } from 'react';
import { FooterFrame } from '../shared/FooterFrame';
import { MessageSquareTextIcon, CircleUserIcon, FolderGit2Icon, MailIcon, FileUserIcon } from 'lucide-react';
import { TooltipButton } from '../shared/TooltipButton';
import { useAtom } from 'jotai';
import { activeFaceAtom } from '@/atoms/atomStore';

interface NavigationProps {
    variant?: 'default' | 'mobile';
}

export const Navigation = ({ variant = 'default' }: NavigationProps) => {
    const [activeFace, setActiveFace] = useAtom(activeFaceAtom);

    // Color scheme based on variant
    const iconColorClass = variant === 'mobile'
        ? 'text-foreground'
        : 'text-white dark:text-muted';

    return (
        <FooterFrame variant={variant}>
            <TooltipButton
                tooltip={activeFace === 'chat' ? false : true}
                disabled={activeFace === 'chat'}
                inputIcon={<div className={iconColorClass}>
                    <MessageSquareTextIcon
                    style={{ width: '18px', height: '18px' }}
                    />
                </div>}
                tooltipText={activeFace !== 'chat' ? "Open Chat" : ''}
                handleClick={() => setActiveFace('chat')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'about' ? false : true}
                disabled={activeFace === 'about'}
                inputIcon={<div className={iconColorClass}>
                    <CircleUserIcon
                    style={{ width: '18px', height: '18px' }}
                    />
                </div>}
                tooltipText={"About"}
                handleClick={() => setActiveFace('about')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'projects' ? false : true}
                disabled={activeFace === 'projects'}
                inputIcon={<div className={iconColorClass}>
                    <FolderGit2Icon
                    style={{ width: '18px', height: '18px' }}
                    />
                </div>}
                tooltipText={"Projects"}
                handleClick={() => setActiveFace('projects')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'contact' ? false : true}
                disabled={activeFace === 'contact'}
                inputIcon={<div className={iconColorClass}>
                    <MailIcon
                    style={{ width: '18px', height: '18px' }}
                    />
                </div>}
                tooltipText={"Contact"}
                handleClick={() => setActiveFace('contact')}
                state={true}
                round={true}
                size={10}
            />
            <TooltipButton
                tooltip={activeFace === 'resume' ? false : true}
                disabled={activeFace === 'resume'}
                inputIcon={<div className={iconColorClass}>
                    <FileUserIcon
                    style={{ width: '18px', height: '18px' }}
                    />
                </div>}
                tooltipText={"Resume"}
                handleClick={() => setActiveFace('resume')}
                state={true}
                round={true}
                size={10}
            />
        </FooterFrame>
    )
}
