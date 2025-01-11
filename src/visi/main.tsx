import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Root, createRoot } from 'react-dom/client';

import { ZStatePlus, get_updated_report } from './zstate';
import { GnustoRunner, GnustoEngine } from './zstate';
import { set_runner, show_commentary } from './combuild';
import { gamedat_ids, gamedat_global_names, gamedat_object_ids, sourceloc_start, find_sourceloc_for_id, sourceloc_for_srctoken } from './gamedat';

import { ContextContent, ReactCtx } from './context';
import { SourceLocState, new_sourcelocstate } from './context';
import { AppMenu } from './menu';
import { ObjectTree } from './objtree';
import { ObjectPage } from './objpage';
import { TimerTable } from './timers';
import { CallActivity } from './activity';
import { SourceFileList } from './filelist';
import { SourceView } from './sourceview';
import { GlobalState } from './globstate';
import { AboutPage } from './about';

let runner: GnustoRunner;
let engine: GnustoEngine;

/* Hack alert: we're not running in Node.js here! But the rollup
   configuration replaces "process.env.NODE_ENV" with a static string,
   so we can check it. */
const releaseTarget = process.env.NODE_ENV;

export function init(runnerref: any)
{
    runner = runnerref;
    engine = runner.e;

    set_runner(runner);

    engine.prepare_vm_report({
        MAX_OBJECTS: gamedat_ids.MAX_OBJECTS,
        MAX_GLOBALS: gamedat_ids.MAX_GLOBALS,
        PROP_TABLE_START: gamedat_ids.PROP_TABLE_START,
        PROP_TABLE_END: gamedat_ids.PROP_TABLE_END,
        C_TABLE_LEN: gamedat_ids.C_TABLE_LEN,
        C_TABLE_GLOB: gamedat_global_names.get('C-TABLE')!.num,
    });
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <VisiZorkApp /> );
}

function VisiZorkApp()
{
    let viewpaneref = useRefDiv();
    
    const [ zstate, setZState ] = useState(get_updated_report(engine));
    const [ tab, setTab ] = useState('objtree');
    const [ objpage, setObjPage ] = useState(0);
    const [ shownumbers, setShowNumbers ] = useState(false);
    const [ sourcelocs, setSourceLocs ] = useState([ new_sourcelocstate() ]);
    const [ sourcelocpos, setSourceLocPos ] = useState(0);

    function setTabWrap(tab: string) {
        setTab(tab);
        setObjPage(0);
    }

    function setObjPageWrap(onum: number) {
        setTab('objtree');
        setObjPage(onum);
        
        let obj = gamedat_object_ids.get(onum);
        if (obj)
            rctx.setLoc(obj.sourceloc, false);
    }
    
    function setLoc(loc: string, hi: boolean) {
        if (!loc)
            return;
        let ls = [ ...sourcelocs.slice(0, sourcelocpos+1), { loc:loc, lochi:hi } ];
        setSourceLocs(ls);
        setSourceLocPos(ls.length-1);
    }

    function shiftLoc(forward: boolean) {
        if (forward) {
            if (sourcelocpos < sourcelocs.length-1)
                setSourceLocPos(sourcelocpos+1);
        }
        else {
            if (sourcelocpos > 0)
                setSourceLocPos(sourcelocpos-1);
        }
    }

    useEffect(() => {
        function evhan_zstate(ev: Event) {
            setZState(get_updated_report(engine));
        };
        function evhan_sourceloc(ev: Event) {
            let detail = (ev as CustomEvent).detail;
            let sourceloc;
            if (detail.idtype == 'SRC')
                sourceloc = sourceloc_for_srctoken(detail.id);
            else
                sourceloc = find_sourceloc_for_id(detail.idtype, detail.id);
            if (!sourceloc) {
                console.log('BUG: sourceloc not found', detail);
                return;
            }
            setLoc(sourceloc, (detail.idtype == 'GLOB'));
        }
        window.addEventListener('zmachine-update', evhan_zstate);
        window.addEventListener('zil-source-location', evhan_sourceloc);
        let resizer: ResizeObserver|undefined;
        let panesize = -1;
        if (viewpaneref.current) {
            resizer = new ResizeObserver((entries) => {
                if (entries.length) {
                    let newsize = entries[0].contentRect.width;
                    if (newsize < panesize-1 || newsize > panesize+1) {
                        panesize = newsize;
                        if (viewpaneref.current) {
                            if (panesize < 360)
                                viewpaneref.current.classList.add('Narrow');
                            else
                                viewpaneref.current.classList.remove('Narrow');
                        }
                    }
                }
            });
            resizer.observe(viewpaneref.current);
        }
        return () => {
            window.removeEventListener('zmachine-update', evhan_zstate);
            window.removeEventListener('zil-source-location', evhan_sourceloc);
            if (resizer)
                resizer.disconnect();
        };
    }, []);

    if (releaseTarget == 'development') {
        (window as any).curzstate = zstate;
    }

    let rctx: ContextContent = {
        zstate: zstate,
        tab: tab,
        setTab: setTabWrap,
        objpage: objpage,
        setObjPage: setObjPageWrap,
        shownumbers: shownumbers,
        setShowNumbers: setShowNumbers,
        sourcelocs: sourcelocs,
        sourcelocpos: sourcelocpos,
        setLoc: setLoc,
        shiftLoc: shiftLoc,
        showCommentary: show_commentary,
    };

    let menuel = document.getElementById('appcontrols');
    
    return (
        <ReactCtx.Provider value={ rctx }>
            <div className="ViewPane" ref={ viewpaneref }>
                <TabbedPane />
            </div>
            <div className="SourcePane">
                <SourceView />
            </div>
            { menuel ? createPortal(<AppMenu />, menuel) : null }
        </ReactCtx.Provider>
    );
}

const tab_list = [
    [ 'objtree', 'World' ],
    [ 'activity', 'Activity' ],
    [ 'globals', 'State' ],
    [ 'timers', 'Timers' ],
    [ 'filelist', 'Files' ],
    [ 'about', '?' ],
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
        if (rctx.objpage == 0)
            tabcontent = <ObjectTree />;
        else
            tabcontent = <ObjectPage onum={ rctx.objpage } />;
        break;
    case 'activity':
        tabcontent = <CallActivity />;
        break;
    case 'globals':
        tabcontent = <GlobalState />;
        break;
    case 'timers':
        tabcontent = <TimerTable />;
        break;
    case 'filelist':
        tabcontent = <SourceFileList />;
        break;
    case 'about':
        tabcontent = <AboutPage />;
        break;
    default:
        tabcontent = <>{ rctx.tab } not implemented</>;
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

const useRefDiv = () => useRef<HTMLDivElement>(null);
