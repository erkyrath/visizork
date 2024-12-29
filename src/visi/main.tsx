import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';
import { sourceloc_start } from './gamedat';

import { ContextContent, ReactCtx } from './context';
import { ObjectTree } from './objtree';
import { StringActivity } from './activity';
import { SourceFileList } from './filelist';
import { SourceView } from './sourceview';

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
    const [ tab, setTab ] = useState('objtree');
    const [ loc, setLoc ] = useState(sourceloc_start());

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
        tab: tab,
        setTab: setTab,
        loc: loc,
        setLoc: setLoc,
    };
    
    return (
        <ReactCtx.Provider value={ rctx }>
            <div className="ViewPane">
                <TabbedPane />
            </div>
            <div className="SourcePane">
                <SourceView />
            </div>
        </ReactCtx.Provider>
    );
}

const tab_list = [
    [ 'objtree', 'World' ],
    [ 'activity', 'Trace' ],
    [ 'filelist', 'Files' ],
];

function TabbedPane()
{
    let rctx = useContext(ReactCtx);

    let ells = tab_list.map(([key, label]) => {
        let cla = 'TabItem';
        if (key == rctx.tab)
            cla += ' Selected';
        
        function evhan_click(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            ev.stopPropagation();
            rctx.setTab(key);
        }
    
        return (
            <div key={ key } className={ cla } onClick={ evhan_click }>
                { label }
            </div>
        );
    });
    
    return (
        <>
            <div className="TabBar">
                { ells }
            </div>
            <div className="TabContent">
                <ObjectTree />
            </div>
        </>
    );
}
