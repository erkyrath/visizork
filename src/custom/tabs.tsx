import React from 'react';
import { useContext } from 'react';

import { ReactCtx } from '../visi/context';

import { CallActivity } from '../visi/activity';
import { TimerTable } from '../visi/timers';
import { GameMap } from '../visi/map';
import { ObjectTree } from '../visi/objtree';
import { ObjectPage } from '../visi/objpage';
import { GlobalState } from '../visi/globstate';
import { SourceFileList } from '../visi/filelist';
import { AboutPage } from '../visi/about';

const tab_list = [
    [ 'activity', 'Activity' ],
    [ 'objtree', 'World' ],
    [ 'map', 'Map' ],
    [ 'globals', 'State' ],
    [ 'timers', 'Timers' ],
    [ 'filelist', 'Files' ],
    [ 'about', '?' ],
];

export function TabbedPane()
{
    let rctx = useContext(ReactCtx);

    let ells = tab_list.map(([key, label]) => {
        let cla = 'TabItem';
        if (key == rctx.tab)
            cla += ' Selected';
        else if (key == 'about' && !rctx.readabout)
            cla += ' Flashing';
        
        function evhan_click(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            ev.stopPropagation();
            rctx.setTab(key);
        }
    
        return (
            <div key={ key } className={ cla } onClick={ evhan_click }>
                <span>{ label }</span>
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
    case 'map':
        tabcontent = <GameMap />;
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
