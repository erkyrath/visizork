import React from 'react';
import { useContext } from 'react';

import { ReactCtx } from './context';

export function ObjPageLink({ onum }: { onum:number } )
{
    let rctx = useContext(ReactCtx);
    
    function evhan_click_showpage(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        ev.stopPropagation();
        rctx.setObjPage(onum);
    }

    return (
        <button className="ObjPage" onClick={ evhan_click_showpage }>i</button>
    );
}

export function Commentary({ topic, smaller }: { topic:string, smaller?:boolean } )
{
    let rctx = useContext(ReactCtx);
    
    function evhan_click_showtopic(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        ev.preventDefault();
        ev.stopPropagation();
        rctx.showCommentary(topic);
    }

    let cla = (smaller ? "CommentButtonSmall" : "CommentButton");
    
    return (
        <a className={ cla } onClick={ evhan_click_showtopic }>
            <img src="css/comment.svg" />
        </a>
    );
}
