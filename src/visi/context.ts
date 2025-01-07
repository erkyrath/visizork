import { createContext } from 'react';

import { ZStatePlus, zstateplus_empty } from './zstate';
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
    zstate: ZStatePlus;
    tab: string;
    shownumbers: boolean;
    objpage: number;
    setObjPage: (loc:number) => void;
    setShowNumbers: (loc:boolean) => void;
    setTab: (loc:string) => void;
    sourcelocs: SourceLocState[];
    sourcelocpos: number;
    setLoc: (loc:string, hi:boolean) => void;
    shiftLoc: (forward: boolean) => void;
};

export const ReactCtx = createContext({
    zstate: zstateplus_empty(),
    tab: '',
    shownumbers: false,
    objpage: 0,
    setObjPage: (val) => {},
    setShowNumbers: (val) => {},
    setTab: (loc) => {},
    sourcelocs: [],
    sourcelocpos: 0,
    setLoc: (loc, hi) => {},
    shiftLoc: (forward) => {},
} as ContextContent);

