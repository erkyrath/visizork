import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';

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
    
    return (
        <div>
            <ObjectTree zstate={ zstate } />
        </div>
    );
}

function ObjectTree({ zstate } : { zstate:ZState })
{
    let ells = zstate.objects.map(tup => {
        let obj = (window as any).gamedat_object_ids.get(tup.onum);
        if (!obj) {
            return <li key={ tup.onum }>???</li>;
        }
        
        return (
            <li key={ tup.onum }>
                { obj.name } "{ obj.desc }": { tup.parent } { tup.sibling } { tup.child }
            </li>
        );
    });
    
    return (
        <ul>
            { ells }
        </ul>
    );
}
