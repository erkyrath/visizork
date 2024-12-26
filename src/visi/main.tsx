import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';

import { ContextContent, ReactCtx } from './context';
import { ObjectTree } from './objtree';
import { StringActivity} from './activity';

// This is the GnustoRunner and the GnustoEngine, but I don't have
// type info for them yet.
let runner: any;
let engine: any;

/* Hack alert: we're not running in Node.js here! But the rollup
   configuration replaces "process.env.NODE_ENV" with a static string,
   so we can check it. */
const releaseTarget = process.env.NODE_ENV;

export function init(runnerref: any)
{
    runner = runnerref;
    engine = runner.e;

    //### should pull from gamedat
    engine.prepare_vm_report({ MAX_OBJECTS:250 });
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <MyApp /> );
}

function MyApp()
{
    const [ zstate, setZState ] = useState(engine.get_vm_report() as ZState);

    useEffect(() => {
        function evhan(ev: Event) {
            setZState(engine.get_vm_report());
        };
        window.addEventListener('zmachine-update', evhan);
        return () => {
            window.removeEventListener('zmachine-update', evhan);
        };
    }, []);

    if (releaseTarget == 'development') {
        (window as any).curzstate = zstate;
    }

    let rctx: ContextContent = {
        zstate: zstate,
    };
    
    return (
        <ReactCtx.Provider value={ rctx }>
            <div className="ListPane">
                <StringActivity />
            </div>
        </ReactCtx.Provider>
    );
}
