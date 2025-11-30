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
    readabout: boolean;
    theme: 'light'|'dark'|'system'|null;
    arrangement: string;
    objpage: number;
    sourcelocs: SourceLocState[];
    sourcelocpos: number;
    setObjPage: (loc:number) => void;
    setShowNumbers: (loc:boolean) => void;
    setTab: (loc:string) => void;
    setLoc: (loc:string, hi:boolean) => void;
    shiftLoc: (forward: boolean) => void;
    setTheme: (arr: 'light'|'dark'|'system') => void;
    setArrangement: (arr: string) => void;
    showCommentary: (topic:string) => void;
};

export const ReactCtx = createContext({
    zstate: zstateplus_empty(),
    tab: '',
    shownumbers: false,
    readabout: false,
    theme: null,
    arrangement: '',
    objpage: 0,
    sourcelocs: [],
    sourcelocpos: 0,
    setObjPage: (val) => {},
    setShowNumbers: (val) => {},
    setTab: (loc) => {},
    setLoc: (loc, hi) => {},
    shiftLoc: (forward) => {},
    setTheme: (val) => {},
    setArrangement: (arr) => {},
    showCommentary: (topic) => {},
} as ContextContent);

