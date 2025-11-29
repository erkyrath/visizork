/* Utilities to load some simple preferences from a cookie, and save them
   back out.
*/

type CookiePrefs = {
    readabout: boolean;
    shownumbers: boolean;
    darktheme: boolean|null;
    arrange: string;
};

export function default_prefs() : CookiePrefs
{
    return {
        readabout: false,
        shownumbers: false,
        darktheme: null,
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
        case 'visizork_theme=dark':
            res.darktheme = true;
            break;
        case 'visizork_theme=light':
            res.darktheme = false;
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

/* The OS dark/light theme flag, last time we checked it. I know, caching
   values isn't React-style -- sorry. (It's only set by an Effect.)
*/
let os_dark_theme: boolean|null = null;

export function set_body_class(arrange: string, darkpref: boolean|null, darkos?: boolean)
{
    if (darkos !== undefined)
        os_dark_theme = darkos;
    
    let cla = 'Arrange'+arrange;
    if (darkpref === true || (darkpref === null && os_dark_theme))
        cla += ' DarkTheme';
    document.body.className = cla;
}
