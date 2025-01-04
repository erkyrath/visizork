import React from 'react';
import { useState, useContext, useEffect } from 'react';

import { ReactCtx } from './context';

export function AppMenu()
{
    const [ menuopen, setMenuOpen ] = useState(false);
    const [ arrangement, setArrangement ] = useState('12');

    let rctx = useContext(ReactCtx);
    
    function handle_click_menu(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        setMenuOpen(!menuopen);
    }
    
    function handle_click_arrange(val: string) {
        setArrangement(val);
        document.body.className = 'Arrange'+val;
        setMenuOpen(false);
    }
    
    function evhan_change_numbers(ev: ChangeEv) {
        rctx.setShowNumbers(!rctx.shownumbers);
    }

    return (
        <>
            <button id="menubutton" onClick={ handle_click_menu }>Menu</button>
            <div className={ menuopen ? 'Menu MenuOpen' : 'Menu' }>
                <div>
                    <ArrangeButton arrange='12' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='21' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='121' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='111' curarrange={ arrangement} handle={ handle_click_arrange } />
                </div>
                <div>
                    <input id="numbers_checkbox" type="checkbox" checked={ rctx.shownumbers } onChange={ evhan_change_numbers } />{' '}
                    <label htmlFor="numbers_checkbox">Show addresses</label>
                </div>
            </div>
        </>
    );
}

function ArrangeButton({ arrange, curarrange, handle }: { arrange:string, curarrange:string, handle:(key:string)=>void })
{
    let issel = (arrange == curarrange);
    let imgsrc = "css/arrange-" + arrange + ".svg";
    
    function handle_click_arrange(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        handle(arrange);
    }
    
    return (
        <button className={ issel ? 'Selected' : '' } onClick={ handle_click_arrange }><img className="ArrangeIcon" src={ imgsrc } /></button>
    );
}

type ChangeEv = React.ChangeEvent<HTMLInputElement>;
