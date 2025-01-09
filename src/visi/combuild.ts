import { GnustoRunner } from './zstate';
import { gamedat_commentary } from './gamedat';

let runner: GnustoRunner|undefined;

export function set_runner(runnerref: GnustoRunner)
{
    runner = runnerref;
}

export function show_commentary(topic: string)
{
    topic = 'OBJ:ADVENTURER'; //###
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
    if (!spec)
        return undefined;
    
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
            
        case 'extlink': {
            let el = document.createElement('a');
            el.className = 'External';
            el.setAttribute('target', '_blank');
            el.setAttribute('href', span[2]);
            el.appendChild(document.createTextNode(span[1]));
            pel.appendChild(el);
            break;
        }
            
        case 'loc': {
            let el = document.createElement('a');
            el.className = 'Internal Com_Id';
            el.setAttribute('href', '#');
            el.appendChild(document.createTextNode(span[1]));
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
