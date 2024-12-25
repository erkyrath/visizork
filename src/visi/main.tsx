import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';

import { ContextContent, ReactCtx } from './context';
import { ObjectTree } from './objtree';

// This is the GnustoRunner and the GnustoEngine, but I don't have
// type info for them yet.
let runner: any;
let engine: any;

export function init(runnerref: any)
{
    runner = runnerref;
    engine = runner.e;
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <MyApp /> );
}

function MyApp()
{
    const [ zstate, setZState ] = useState(engine.get_vm_report() as ZState);
    console.log('### ...', zstate);

    useEffect(() => {
        function evhan(ev: Event) {
            setZState(engine.get_vm_report());
        };
        window.addEventListener('zmachine-update', evhan);
        return () => {
            window.removeEventListener('zmachine-update', evhan);
        };
    }, []);

    let rctx: ContextContent = {
        zstate: zstate,
    };
    
    return (
        <ReactCtx.Provider value={ rctx }>
            <div className="ListPane">
                <ObjectTree />
            </div>
        </ReactCtx.Provider>
    );
}
