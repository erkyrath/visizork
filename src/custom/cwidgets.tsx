import React from 'react';
import { useState, useContext, createContext } from 'react';

export function ObjListSorter()
{
    const [ follow, setFollow ] = useState('adv');
    
    function evhan_follow_change(val: string) {
        setFollow(val);
    }
    
    return (
        <div>
            Follow{' '}
            <input id="followadv_radio" type="radio" name="follow" value="adv" checked={ follow=='adv' } onChange={ (ev) => evhan_follow_change('adv') } />
            <label htmlFor="followadv_radio">Adventurer</label>{' '}
            <input id="followthief_radio" type="radio" name="follow" value="thief" checked={ follow=='thief' } onChange={ (ev) => evhan_follow_change('thief') } />
            <label htmlFor="followthief_radio">Thief</label>
        </div>
    );
}
