import React from 'react';
import { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Root, createRoot } from 'react-dom/client';

import { ZState } from './zstate';
import { sourceloc_start } from './gamedat';

import { ContextContent, ReactCtx } from './context';
import { SourceLocState, new_sourcelocstate } from './context';
import { ObjectTree } from './objtree';
import { StringActivity, CallActivity } from './activity';
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
    const [ sourcelocs, setSourceLocs ] = useState([ new_sourcelocstate() ]);
    const [ sourcelocpos, setSourceLocPos ] = useState(0);

    function setLoc(loc:string, hi:boolean) {
        let ls = [ ...sourcelocs, { loc:loc, lochi:hi } ];
        setSourceLocs(ls);
        setSourceLocPos(ls.length-1);
    }

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
        sourcelocs: sourcelocs,
        sourcelocpos: sourcelocpos,
        setLoc: setLoc,
    };

    let menuel = document.getElementById('appcontrols');
    
    return (
        <ReactCtx.Provider value={ rctx }>
            <div className="ViewPane">
                <TabbedPane />
            </div>
            <div className="SourcePane">
                <SourceView />
            </div>
            { menuel ? createPortal(<div>Menu</div>, menuel) : null }
        </ReactCtx.Provider>
    );
}

const tab_list = [
    [ 'objtree', 'World' ],
    [ 'activity', 'Trace' ],
    [ 'functivity', 'Calls' ],
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

    let tabcontent;
    switch (rctx.tab) {
    case 'objtree':
        tabcontent = <ObjectTree />;
        break;
    case 'activity':
        tabcontent = <StringActivity />;
        break;
    case 'functivity':
        tabcontent = <CallActivity />;
        break;
    case 'filelist':
        tabcontent = <SourceFileList />;
        break;
    default:
        tabcontent = <></>;
        break;
    }
    
    return (
        <>
            <div className="TabBar">
                { ells }
            </div>
            <div className="TabContent">
                { tabcontent }
            </div>
        </>
    );
}
