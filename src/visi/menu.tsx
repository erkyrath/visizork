import React from 'react';
import { useState, useContext, useEffect } from 'react';

import { set_cookie, set_body_pref_theme, set_body_pref_arrange } from './cookie';

import { ReactCtx } from './context';

export function AppMenu()
{
    const [ menuopen, setMenuOpen ] = useState(false);

    let rctx = useContext(ReactCtx);
    let arrangement = rctx.arrangement;
    let theme = rctx.theme;
    
    function handle_click_menu(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        setMenuOpen(!menuopen);
    }
    
    function handle_click_arrange(val: string) {
        rctx.setArrangement(val);
        set_cookie('arrange', val);
        set_body_pref_arrange(val);
        setMenuOpen(false);
    }
    
    function evhan_change_theme(val: 'light'|'dark'|'system') {
        rctx.setTheme(val);
        set_cookie('theme', val);
        set_body_pref_theme(val);
        setMenuOpen(false);
    }
    
    function evhan_change_numbers(ev: ChangeEv) {
        rctx.setShowNumbers(!rctx.shownumbers);
    }

    return (
        <>
            <button id="menubutton" className={ menuopen ? 'Selected' : '' } onClick={ handle_click_menu }>
                <img src="css/menu.svg" />
            </button>
            <div className={ menuopen ? 'Menu MenuOpen' : 'Menu' }>
                <div>
                    <ArrangeButton arrange='12' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='21' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='121' curarrange={ arrangement} handle={ handle_click_arrange } />
                    <ArrangeButton arrange='111' curarrange={ arrangement} handle={ handle_click_arrange } />
                </div>
                <div>
                    <input id="darktheme_radio" type="radio" name="theme" value="dark" checked={ rctx.theme==='dark' } onChange={ (ev) => evhan_change_theme('dark') } />
                    {' '}
                    <label htmlFor="darktheme_radio">Dark</label>
                    {' '}
                    <input id="lighttheme_radio" type="radio" name="theme" value="light" checked={ rctx.theme==='light' } onChange={ (ev) => evhan_change_theme('light') } />
                    {' '}
                    <label htmlFor="lighttheme_radio">Light</label>
                    {' '}
                    <input id="systheme_radio" type="radio" name="theme" value="sys" checked={ rctx.theme==='system' } onChange={ (ev) => evhan_change_theme('system') } />
                    {' '}
                    <label htmlFor="systheme_radio">System theme</label>
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
