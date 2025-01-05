import React from 'react';
import { useContext } from 'react';

import { gamedat_ids, gamedat_object_ids } from './gamedat';
import { ZState, ZObject } from './zstate';

import { ReactCtx } from './context';

export function AboutPage()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

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
                    Type commands in the left pane. (If you're not familiar
                    with Zork,{' '}
                    <a target="_blank" href="https://pr-if.org/doc/play-if-card/">here's
                    a quick intro</a>.)
                    As the game responds, the panes on the right will display
                    the current game state and the code that is
                    executing.
                </p>
                <p>
                    Look at the
                    {' '}<a href="#" onClick={ (ev)=>evhan_click_tab(ev, 'objtree') }>World</a>{' '}
                    tab for a start.
                    This shows every object and room in the game.
                    You, the Adventurer, are in the topmost room:{' '}
                    <code>{ curroom }</code>.
                    Listed with you are the objects you
                    can see.{' '}
                    { (firstobj ?
                       <>(Try typing "<code>EXAMINE { firstobj }</code>"!) </>
                       : null) }
                    If you pick up an object, it will shift to be listed
                    under the <code>ADVENTURER</code>.
                </p>
                <p>
                    The other tabs display other aspects of the Z-machine.
                    {' '}<a href="#" onClick={ (ev)=>evhan_click_tab(ev, 'activity') }>Activity</a>{' '}
                    shows the functions called in
                    the most recent turn, and what they printed.
                    {' '}<a href="#" onClick={ (ev)=>evhan_click_tab(ev, 'globals') }>State</a>{' '}
                    shows the state of the world &#x2014; the 158 global variables
                    at least. (Objects have property variables
                    as well, which you can view from the World tab.)
                </p>
                <p>
                    Click on any function, object, or variable to see its
                    definition in the source code.
                </p>
                <h2>Which Zork is this?</h2>
                <p>
                    The first version of Zork was written in 1977 by energetic
                    MIT students, in a LISP-y language called MDL. A few
                    years later, as part of Infocom, they rewrote it &#x2014; 
                    piecewise &#x2014; with a homebrew portable tool they called ZIL.
                    (For &#x201C;Zork Implementation Language&#x201D;.)
                </p>
                <p>
                    The version you see here dates from 1984. (The serial number
                    &#x201C;840726&#x201D; shows the compile date.) By this point,
                    the Infocom folks had combined the common parts of
                    Zork 1, 2, and 3 &#x2014; the parser and generic actions &#x2014;
                    into a (roughly) common library shared between the
                    three games. You'll see quite a bit of code which
                    is meant for Zork 2 or 3; these segments are compiled
                    out (inactive) for Zork 1.
                </p>
                <p>
                    This 1984 release is the one most commonly seen today,
                    because it was included in the &#x201C;Lost Treasures of
                    Infocom&#x201D; collection and later collections.
                    I have therefore selected it for this exhibit.
                    That was not the final version, however. In 1987
                    Infocom released the &#x201C;Solid Gold&#x201D; edition with
                    built-in InvisiClues.
                </p>
            </div>
        </div>
    );
}

//### about Z-machine?
//### which version of Zork and why
//### software acknowledgements
