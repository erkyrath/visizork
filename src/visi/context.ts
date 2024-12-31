import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';
import { sourceloc_start } from './gamedat';

export type ContextContent = {
    zstate: ZState;
    tab: string;
    setTab: (loc:string) => void;
    sourceloc: string;
    sourcehi: boolean;
    setLoc: (loc:string, hi:boolean) => void;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
    tab: '',
    setTab: (loc) => {},
    sourceloc: sourceloc_start(),
    sourcehi: false,
    setLoc: (loc, hi) => {},
} as ContextContent);

