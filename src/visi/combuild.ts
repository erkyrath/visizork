/* Code to build a commentary DOM element for display. */

import { GnustoRunner } from './zstate';
import { refresh_batteries } from './zstate';
import { gamedat_commentary } from './gamedat';

let runner: GnustoRunner|undefined;

/* Called at startup to stash the GnustoRunner reference.
   (Which will also be available as window.runner, so this isn't really
   necessary. But hey, let's work clean.)
*/
export function set_runner(runnerref: GnustoRunner)
{
    runner = runnerref;
}

/* Display a commentary topic.
*/
export function show_commentary(topic: string)
{
    let nod = build_commentary(topic);

    if (!runner) {
        console.log('BUG: runner not set');
        return;
    }

    // Special case!
    if (topic == 'BATTERIES') {
        refresh_batteries(runner.e);
    }
    
    runner.commentary.show(nod, topic);
}

/* Construct a DOM node containing the text of a commentary topic.
   This will be passed to CommentaryClass.show().
*/
function build_commentary(topic: string) : Node|undefined
{
    let spec = gamedat_commentary[topic];
    if (!spec) {
        console.log('BUG: missing topic', topic);
        return undefined;
    }

    function evhan_click(cla: string, typ: string, id: string) {
        let token;
        if (typ)
            token = typ+':'+id;
        else
            token = id;
        
        if (cla == 'src' || cla == 'comsrc') {
            if (typ) {
                let dat = { idtype:typ, id:id };
                window.dispatchEvent(new CustomEvent('zil-source-location', { detail:dat }));
            }
        }
        if (cla == 'com' || cla == 'comsrc')
            show_commentary(token);
    }
    
    let parel = document.createElement('div');
    parel.className = 'Commentary';
    
    let pel = document.createElement('p');
    parel.appendChild(pel);

    for (let span of spec) {
        if (typeof span === 'string') {
            pel.appendChild(document.createTextNode(span));
            continue;
        }

        let key = span[0];
        
        if (key == 'br') {
            pel = document.createElement('p');
            parel.appendChild(pel);
            continue;
        }

        switch (key) {
            
        case 'code': {
            let el = document.createElement('code');
            el.appendChild(document.createTextNode(span[1]));
            pel.appendChild(el);
            break;
        }
            
        case 'emph': {
            let el = document.createElement('em');
            el.appendChild(document.createTextNode(span[1]));
            pel.appendChild(el);
            break;
        }
            
        case 'extlink': {
            let [ __, url, label ] = span;
            if (!label.length)
                label = url;
            let el = document.createElement('a');
            el.className = 'External';
            el.setAttribute('target', '_blank');
            el.setAttribute('href', url);
            el.appendChild(document.createTextNode(label));
            pel.appendChild(el);
            break;
        }
            
        case 'com':
        case 'src':
        case 'comsrc': {
            let [ __, id, idtyp, label ] = span;
            if (!label.length)
                label = id;
            // This is a hack, yeah
            let isid = (label == label.toUpperCase());
            let el = document.createElement('a');
            let cla = (key == 'src' ? 'SourceOnly' : 'Internal');
            if (isid)
                cla += ' Com_Id';
            el.className = cla;
            el.setAttribute('href', '#');
            el.addEventListener('click', (ev) => { ev.preventDefault(); evhan_click(key, idtyp, id); });
            el.appendChild(document.createTextNode(label));
            pel.appendChild(el);
            break;
        }
            
        default:
            console.log('BUG: unrecognized comspan', span);
            break;
        }
        
    }
    
    return parel;
}
