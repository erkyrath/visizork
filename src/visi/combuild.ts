import { GnustoRunner } from './zstate';
import { gamedat_commentary } from './gamedat';

let runner: GnustoRunner|undefined;

export function set_runner(runnerref: GnustoRunner)
{
    runner = runnerref;
}

export function show_commentary(topic: string)
{
    console.log('### commentary', topic);

    let nod = build_commentary(topic);

    if (!runner) {
        console.log('BUG: runner not set');
        return;
    }
    
    runner.commentary.show(nod);
}

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
        
        console.log('###', cla, typ, id);
        if (typ) {
            let dat = { idtype:typ, id:id };
            window.dispatchEvent(new CustomEvent('zil-source-location', { detail:dat }));
        }
        //### reverse default?
        if (cla == 'loccom' || !typ)
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
            let el = document.createElement('a');
            el.className = 'External';
            el.setAttribute('target', '_blank');
            el.setAttribute('href', span[2]);
            el.appendChild(document.createTextNode(span[1]));
            pel.appendChild(el);
            break;
        }
            
        case 'loc':
        case 'loccom': {
            let id = span[1];
            let typ = span[2];
            let el = document.createElement('a');
            el.className = 'Internal Com_Id';
            el.setAttribute('href', '#');
            el.addEventListener('click', (ev) => { ev.preventDefault(); evhan_click(key, typ, id); });
            el.appendChild(document.createTextNode(id));
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
