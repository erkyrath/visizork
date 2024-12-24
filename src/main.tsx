import React from 'react';
import { useState, useContext, useReducer } from 'react';
import { Root, createRoot } from 'react-dom/client';

// This is the GnustoEngine, but I don't have type info for it yet.
let engine: any;

export function init(engineref: any)
{
    engine = engineref;
    
    const appel = document.getElementById('appbody') as HTMLElement;
    let root = createRoot(appel);
    if (root)
        root.render( <MyApp /> );
}

function MyApp()
{
    return (
        <div>
            THE APP!
        </div>
    );
}
