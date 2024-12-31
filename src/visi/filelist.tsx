import React from 'react';
import { useState, useContext, createContext } from 'react';

import { sourcefile_list, sourceloc_for_key } from './gamedat';

import { ReactCtx } from './context';

export type FileListContextContent = {
    selected: string;
    setSelected: (val:string) => void;
};

function new_context() : FileListContextContent
{
    return {
        selected: '',
        setSelected: (val) => {},
    };
}

const FileListCtx = createContext(new_context());

export function SourceFileList()
{
    const [ selected, setSelected ] = useState('');
    
    let rctx = useContext(ReactCtx);

    let ells = sourcefile_list.map(([name, key]) =>
        <SourceFile filename={ name } key={ key } filekey={ key } />
    );  

    function evhan_click_background(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        ev.stopPropagation();
        setSelected('');
    }

    return (
        <FileListCtx.Provider value={ { selected, setSelected } }>
            <div className="ScrollContent" onClick={ evhan_click_background }>
                <ul className="DataList">
                    { ells }
                </ul>
            </div>
        </FileListCtx.Provider>
    );
}

function SourceFile({ filename, filekey } : { filename:string, filekey:string })
{
    let rctx = useContext(ReactCtx);
    let ctx = useContext(FileListCtx);
    let selected = ctx.selected;

    function evhan_click(ev: React.MouseEvent<HTMLLIElement, MouseEvent>) {
        ev.stopPropagation();
        ctx.setSelected(filekey);
        rctx.setLoc(sourceloc_for_key(filekey), false);
    }
    
    return (
        <li className={ (filekey==selected) ? 'Selected' : '' } onClick={ evhan_click }>
            { filename }
        </li>
    );
}
