import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';
import { SourceLoc, sourceloc_start } from './gamedat';

export type ContextContent = {
    zstate: ZState;
    loc: SourceLoc;
    setLoc: (loc:SourceLoc) => void;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
    loc: sourceloc_start(),
    setLoc: (loc) => {},
} as ContextContent);

