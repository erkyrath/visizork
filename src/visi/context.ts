import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';
import { sourceloc_start } from './gamedat';

export type ContextContent = {
    zstate: ZState;
    loc: string;
    setLoc: (loc:string) => void;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
    loc: sourceloc_start(),
    setLoc: (loc) => {},
} as ContextContent);

