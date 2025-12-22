import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import { gamedat_ids, gamedat_global_names } from './gamedat';

import { GnustoRunner, GnustoEngine } from '../visi/zstate';
import { default_prefs, get_cookie_prefs, set_body_pref_theme, set_body_pref_arrange } from '../visi/cookie';
import { set_runner } from '../visi/combuild';
import { VisiZorkApp, set_app_context } from '../visi/main';

let runner: GnustoRunner;
let engine: GnustoEngine;

let initprefs = default_prefs();

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
    
    initprefs = get_cookie_prefs();
    set_body_pref_arrange(initprefs.arrange);
    set_body_pref_theme(initprefs.theme);

    set_app_context(engine, initprefs);
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <VisiZorkApp /> );
}
