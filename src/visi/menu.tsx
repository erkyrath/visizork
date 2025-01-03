import React from 'react';
import { useState, useContext, useEffect } from 'react';

export function AppMenu()
{
    const [ menuopen, setMenuOpen ] = useState(false);

    function handle_click_menu(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
	ev.stopPropagation();
	setMenuOpen(!menuopen);
    }
    
    function handle_click_arrange(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
	ev.stopPropagation();
	document.body.className = 'Arrange'+key;
	setMenuOpen(false);
    }
    
    return (
	<>
	    <button id="menubutton" onClick={ handle_click_menu }>Menu</button>
	    <div className={ menuopen ? 'Menu MenuOpen' : 'Menu' }>
		<div>
		    <button onClick={ (ev)=>handle_click_arrange(ev, '12') }>A</button>
		    <button onClick={ (ev)=>handle_click_arrange(ev, '21') }>B</button>
		    <button onClick={ (ev)=>handle_click_arrange(ev, '121') }>C</button>
		    <button onClick={ (ev)=>handle_click_arrange(ev, '111') }>D</button>
		</div>
	    </div>
	</>
    );
}
