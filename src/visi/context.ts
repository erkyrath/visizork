import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';
import { sourceloc_start } from './gamedat';

export type SourceLocState = {
    loc: string;
    lochi: boolean;
};

export function new_sourcelocstate() : SourceLocState
{
    return { loc: sourceloc_start(), lochi: false };
}

export type ContextContent = {
    zstate: ZState;
    tab: string;
    setTab: (loc:string) => void;
    sourcelocs: SourceLocState[];
    sourcelocpos: number;
    setLoc: (loc:string, hi:boolean) => void;
    shiftLoc: (forward: boolean) => void;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
    tab: '',
    setTab: (loc) => {},
    sourcelocs: [],
    sourcelocpos: 0,
    setLoc: (loc, hi) => {},
    shiftLoc: (forward) => {},
} as ContextContent);

