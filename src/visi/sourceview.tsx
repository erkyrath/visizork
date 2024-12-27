import React from 'react';
import { useState, useContext } from 'react';

import { ReactCtx } from './context';

export function SourceView()
{
    let rctx = useContext(ReactCtx);
    let loc = rctx.loc;

    return (
	<div>
	    Location: { loc.file }, { loc.line }:{ loc.char }
	</div>
    );
}
