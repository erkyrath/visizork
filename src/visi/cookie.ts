
export function get_cookie_bool(key: string)
{
    let res = false;
    for (var val of document.cookie.split(';')) {
        if (val.trim() == 'visizork_'+key+'=true') {
            res = true;
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

