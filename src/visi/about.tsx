import React from 'react';
import { useContext } from 'react';

import { gamedat_ids, gamedat_object_ids, gamedat_routine_names } from './gamedat';
import { ZObject } from './zstate';

import { ReactCtx } from './context';
import { ObjPageLink, Commentary } from './widgets';

export function AboutPage()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let lastupdate = '__VISIZORKDATE__';
        
    let curroom = '???';
    let firstobj = '';

    let map: Map<number, ZObject> = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
    }
    
    let advroom: number = gamedat_ids.ADVENTURER;
    while (true) {
        let tup = map.get(advroom);
        if (!tup || tup.parent == 0 || tup.parent == gamedat_ids.ROOMS)
            break;
        advroom = tup.parent;
    }

    if (advroom != gamedat_ids.ADVENTURER) {
        let obj = gamedat_object_ids.get(advroom);
        if (obj) {
            curroom = obj.name;
        }

        let child = map.get(advroom)!.child;
        if (child && child == gamedat_ids.ADVENTURER) {
            child = map.get(child)!.sibling;
        }

        if (child) {
            let cobj = gamedat_object_ids.get(child);
            if (cobj) {
                firstobj = cobj.desc.toUpperCase();
            }
        }
        else if (obj && obj.scenery && obj.scenery.length) {
            let cobj = gamedat_object_ids.get(obj.scenery[0]);
            if (cobj) {
                firstobj = cobj.desc.toUpperCase();
            }
        }
    }
    
    function evhan_click_tab(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, tab: string) {
        ev.preventDefault();
        rctx.setTab(tab);
    }
    
    function evhan_click_routine(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, rtn: string) {
        ev.preventDefault();
        let funcdat = gamedat_routine_names.get(rtn);
        if (funcdat) {
            rctx.setLoc(funcdat.sourceloc, false);
        }
    }
    
    return (
        <div className="ScrollContent">
            <div className="AboutPage">
                <h2>What's going on?</h2>
                <p>
                    You are playing Zork, the classic Infocom text adventure.
                    And you are watching the Z-machine execute the game,
                    live, as you play.
                </p>
                <p>
                    (In case it&#x2019;s not obvious: <em>SPOILERS</em> for Zork 1.
                    The source code gives away everything in the game.
                    The whole point of this project is to demonstrate how
                    Zork works!)
                </p>
                <p>
                    Type commands in the left pane. (If you&#x2019;re not familiar
                    with parser games,{' '}
                    <ExtWebLink url={ 'https://pr-if.org/doc/play-if-card/' } text={ 'here\u2019s a quick intro' } />.)
                    As the game responds, the panes on the right will display
                    the current game state and the code that is
                    executing.
                </p>
                <p>
                    Look at the
                    {' '}<a className="Internal" href="#" onClick={ (ev)=>evhan_click_tab(ev, 'objtree') }>World</a>{' '}
                    tab for a start.
                    This shows every object and room in the game.
                    You, the Adventurer, are in the topmost room:{' '}
                    <code>{ curroom }</code>.
                    Listed with you are the objects you
                    can see.{' '}
                    { (firstobj ?
                       <>(Try typing &#x201C;<code>EXAMINE { firstobj }</code>&#x201D;!) </>
                       : null) }
                    Objects you pick up will be listed directly under
                    the <code>ADVENTURER</code>; they will move with
                    you as part of your inventory.
                </p>
                <p>
                    The other tabs display other aspects of the Z-machine.
                    {' '}<a className="Internal" href="#" onClick={ (ev)=>evhan_click_tab(ev, 'activity') }>Activity</a>{' '}
                    shows the functions called in
                    the most recent turn, and what they printed.
                    {' '}<a className="Internal" href="#" onClick={ (ev)=>evhan_click_tab(ev, 'globals') }>State</a>{' '}
                    shows all the game&#x2019;s global variables.
                    {' '}<a className="Internal" href="#" onClick={ (ev)=>evhan_click_tab(ev, 'timers') }>Timers</a>{' '}
                    shows the table of timed events.
                </p>
                <p>
                    Click on any function, object, or variable to see its
                    definition in the source code. Click on an object&#x2019;s
                    {' '}<ObjPageLink onum={ 4 } /> button
                    to see its current state and place in the world.
                    (This will initially match the source code, but
                    may change as you interact with the game.)
                </p>
                <p>
                    <Commentary topic={ 'ABOUT' } />
                    Click on the green buttons to see commentary about
                    Zork&#x2019;s implementation. Notes, trivia, whatever came
                    into my head as I was building the Visible Zorker!
                </p>
                <h2>Which Zork is this?</h2>
                <p>
                    The first version of Zork was written in 1977 by energetic
                    MIT students, in a LISP-y language called MDL. A few
                    years later, as part of Infocom, they rewrote it &#x2014; 
                    piecewise &#x2014; with a homebrew portable tool they called{' '}
                    <ExtWebLink url={ 'https://blog.zarfhome.com/2019/04/what-is-zil-anyway' } text={ 'ZIL' } />.
                    (For &#x201C;Zork Implementation Language&#x201D;.)
                </p>
                <p>
                    The version you see here dates from 1984. (The serial number
                    &#x201C;840726&#x201D; shows the compile date.) By this point,
                    the Infocom folks had combined the common parts of
                    Zork 1, 2, and 3 into a de-facto library.
                    This library, containing the
                    parser and generic action code, was shared with (almost)
                    no changes between the three games.
                </p>
                <p>
                    The common library (the files &#x201C;gverbs.zil&#x201D;,
                    &#x201C;gparser.zil&#x201D;, etc) do contain bits of
                    code specific to each of the three games. (For example,
                    the game title banners printed in{' '}
                    <code><a className="Internal" href="#" onClick={ (ev)=>evhan_click_routine(ev, 'V-VERSION') }>V-VERSION</a></code>.)
                    The passages meant for Zork 2 and 3 were skipped when
                    compiling Zork 1.
                </p>
                <p>
                    This &#x201C;renovated&#x201D; 1984 release is
                    the one most commonly seen today,
                    because it was included in the &#x201C;
                    <ExtWebLink url={ 'https://archive.org/details/lost-treasures-of-infocom' } text={ 'Lost Treasures of Infocom' } />
                    &#x201D; collection and later collections.
                    I have therefore selected it for this exhibit.
                    That was not the final version, however. In 1987
                    Infocom released the &#x201C;Solid Gold&#x201D; edition with
                    built-in InvisiClues. Archived evidence indicates that
                    they continued updating the source well into 1988.
                </p>
                <h2>Sources and acknowledgements</h2>
                <p>
                    Zork&#x2019;s source code was first{' '}
                    <ExtWebLink url={ 'https://github.com/historicalsource/zork1' } text={ 'publicly released' } />
                    {' '}by Jason Scott in April 2019.
                    I then combed through all known versions and posted my{' '}
                    <ExtWebLink url={ 'https://eblong.com/infocom/' } text={ 'Obsessively Complete Infocom Catalog' } />,
                    which now includes this Visible Zorker exhibition.
                </p>
                <p>
                    The Visible Zorker is built on a seriously customized
                    version of the{' '}
                    <ExtWebLink url={ 'https://github.com/curiousdannii/parchment' } text={ 'Parchment' } /> Z-machine interpreter
                    by Marnanel Thurman, Atul Varma, and Dannii Willis.
                    You can find this, and the rest of the Visible Zorker
                    machinery, on{' '}
                    <ExtWebLink url={ 'https://github.com/erkyrath/visizork' } text={ 'Github' } />.
                </p>
                <p>
                    I used TXD from the{' '}
                    <ExtWebLink url={ 'https://ifarchive.org/indexes/if-archive/infocom/tools/ztools/' } text={ 'ZTools' } />
                    {' '}package to analyze the Zork game file. That
                    process was invaluably aided by the{' '}
                    <ExtWebLink url={ 'https://ifarchive.org/indexes/if-archive/infocom/tools/reform/' } text={ 'Infocom analysis work' } />
                    {' '}done in 2007 by Allen Garvin, Ben Rudiak-Gould,
                    and Ethan Dicks.
                    Allen Garvin&#x2019;s{' '}
                    <ExtWebLink url={ 'http://plover.net/~agarvin/zork1.txt' } text={ 'translation into Inform 6 syntax' } />
                    {' '} was also helpful.
                </p>
                <p>
                    The fonts used are Courier Prime, Lato, and
                    Libre Baskerville. The header background is copied from
                    Infocom&#x2019;s Zork hint maps.
                </p>
                <p>
                    Zork itself was originally written by Tim Anderson,
                    Marc Blank, Bruce Daniels, and Dave Lebling. The
                    commercial versions are copyright 1981 (etc) by Infocom,
                    then Activision, then renamed to Mediagenic,
                    then Bobby Kotick bought it and renamed it Activision,
                    then Vivendi bought it and merged it with Blizzard,
                    then Microsoft consumed the lot. Got it? Good.
                </p>
                <hr/>
                <p>
                    Aside from the above, the Visible Zorker is copyright
                    2025 by Andrew Plotkin. MIT license;{' '}
                    <ExtWebLink url={ 'https://github.com/erkyrath/visizork' } text={ 'Github repo' } />;
                    {' '}last updated { lastupdate }.
                    This exhibit is hosted by the{' '}
                    <ExtWebLink url={ 'https://eblong.com/infocom/' } text={ 'Obsessively Complete Infocom Catalog' } />.
                </p>
            </div>
        </div>
    );
}

function ExtWebLink({ url, text }: { url:string, text:string })
{
    return (
        <a className="External" target="_blank" href={ url }>{ text }</a>
    );
}
