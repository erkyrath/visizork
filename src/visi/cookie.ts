/* Utilities to load some simple preferences from a cookie, and save them
   back out.
*/

type CookiePrefs = {
    readabout: boolean;
    shownumbers: boolean;
    theme: 'light'|'dark'|'system';
    arrange: string;
};

export function default_prefs() : CookiePrefs
{
    return {
        readabout: false,
        shownumbers: false,
        theme: 'system',
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
            res.theme = 'dark';
            break;
        case 'visizork_theme=light':
            res.theme = 'light';
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

/* The various prefs that affect top-level body class. We cache their
   last known values. I know, that's not React-style -- sorry.
*/
let cur_os_theme: 'light'|'dark'|null = null;
let cur_theme: 'light'|'dark'|'system'|null = null;
let cur_arrange: string = '12';

export function set_body_pref_arrange(arrange: string)
{
    if (cur_arrange !== arrange) {
        cur_arrange = arrange;
        set_body_class()
    }
}

export function set_body_pref_theme(theme: 'light'|'dark'|'system')
{
    if (cur_theme !== theme) {
        cur_theme = theme;
        set_body_class();
    }
}

export function set_body_ospref_theme(theme: 'light'|'dark')
{
    if (cur_os_theme !== theme) {
        cur_os_theme = theme;
        set_body_class();
    }
}

function set_body_class()
{
    let cla = 'Arrange'+cur_arrange;
    if (cur_theme === 'dark') {
        cla += ' DarkTheme';
    }
    else if (cur_theme === 'light') {
        // leave it
    }
    else {
        if (cur_os_theme === 'dark')
            cla += ' DarkTheme';
    }
    document.body.className = cla;
}
