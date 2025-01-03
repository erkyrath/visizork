import React from 'react';
import { useState, useContext, useEffect } from 'react';

export function AppMenu()
{
    const [ menuopen, setMenuOpen ] = useState(false);
    const [ arrangement, setArrangement ] = useState('12');

    function handle_click_menu(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        setMenuOpen(!menuopen);
    }
    
    function handle_click_arrange(val: string) {
        setArrangement(val);
        document.body.className = 'Arrange'+val;
        setMenuOpen(false);
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
            </div>
        </>
    );
}

function ArrangeButton({ arrange, curarrange, handle }: { arrange:string, curarrange:string, handle:(key:string)=>void })
{
    let issel = (arrange == curarrange);
    
    function handle_click_arrange(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        handle(arrange);
    }
    
    return (
        <button className={ issel ? 'Selected' : '' } onClick={ handle_click_arrange }>{ arrange }</button>
    );
}
