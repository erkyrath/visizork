import { createContext } from 'react';

import { ZState, zstate_empty } from './zstate';

export type ContextContent = {
    zstate: ZState;
};

export const ReactCtx = createContext({
    zstate: zstate_empty(),
} as ContextContent);
