import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';
import { sourceloc_start } from './gamedat';

export type ContextContent = {
    zstate: ZState;
    tab: string;
    setTab: (loc:string) => void;
    loc: string;
    setLoc: (loc:string) => void;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
    tab: '',
    setTab: (loc) => {},
    loc: sourceloc_start(),
    setLoc: (loc) => {},
} as ContextContent);

