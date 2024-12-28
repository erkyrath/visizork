import React from 'react';
import { useState, useContext } from 'react';

import { sourcefile_list } from './gamedat';

import { ReactCtx } from './context';

export function SourceFileList()
{
    let rctx = useContext(ReactCtx);

    let ells = sourcefile_list.map(([name, key]) =>
	<SourceFile filename={ name } key={ key } filekey={ key } />
    );	

    return (
        <div className="ScrollContent">
            <ul className="DataList">
		{ ells }
            </ul>
	</div>
    );
}

function SourceFile({ filename, filekey } : { filename:string, filekey:string })
{
    return (
	<li>
	    { filename }
	</li>
    );
}
