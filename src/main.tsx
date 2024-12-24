import React from 'react';
import { useState, useContext, useReducer } from 'react';
import { Root, createRoot } from 'react-dom/client';

export function init()
{
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
