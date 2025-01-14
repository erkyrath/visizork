/* Utilities to load some simple preferences from a cookie, and save them
   back out.
*/

type CookiePrefs = {
    readabout: boolean;
    shownumbers: boolean;
    arrange: string;
};

export function default_prefs() : CookiePrefs
{
    return {
        readabout: false,
        shownumbers: false,
        arrange: '12',
    };
}

/* Load prefs from cookies, validating as we go. */
export function get_cookie_prefs() : CookiePrefs
{
    let res = default_prefs();
    
    for (let val of document.cookie.split(';')) {
        switch (val.trim()) {
        case 'visizork_shownumbers=true':
            res.shownumbers = true;
            break;
        case 'visizork_readabout=true':
            res.readabout = true;
            break;
        case 'visizork_arrange=12':
            res.arrange = '12';
            break;
        case 'visizork_arrange=21':
            res.arrange = '21';
            break;
        case 'visizork_arrange=121':
            res.arrange = '121';
            break;
        case 'visizork_arrange=111':
            res.arrange = '111';
            break;
        }
    }
    
    return res;
}

export function set_cookie(key: string, val: string)
{
    let cookie = 'visizork_'+key+'='+val+'; path=/; max-age=31536000';
    document.cookie = cookie;
}

