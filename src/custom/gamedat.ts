/* Typescript types and utilities for the game data.
   All of the window.gamedat_foo maps and lists are set up by
   gamedat.js (which is not this file!) 
*/

import { SourceFileMap, ObjectData, AttributeData, PropertyData, GlobalData, ConstantData, RoutineData, StringData, TableData, DictWordData, PrepositionData, GrammarVerbData, GrammarLineData, ActionData, CommentaryMap, CommentaryLineMap, AllDistanceMap, MapRoom, SourceLinesMap } from '../visi/gametypes';

/* Return the initial sourceloc to display. */
export function sourceloc_start() : string
{
    return 'J:78:1:102:0';  // 'gverbs.zil', lines 78-101
}

/* Turn a location in "GVERBS-90" form into "J:90:1" form.
   (This format turns up in the commentary system.)
*/
export function sourceloc_for_srctoken(val: string) : string|undefined
{
    let pos = val.indexOf('-');
    if (pos < 0)
        return undefined;
    let filekey = sourcefile_capkey_map[val.slice(0, pos)];
    if (!filekey)
        return undefined;
    return filekey+':'+val.slice(pos+1)+':1';
}

/* Given a game symbol, return its source location in sourceloc form
   (like  "C:5:1:6:0").
*/
export function find_sourceloc_for_id(idtype: string, id:string) : string|undefined
{
    switch (idtype) {
    case 'OBJ':
        let obj = gamedat_object_names.get(id);
        if (obj)
            return obj.sourceloc;
        break;
    case 'RTN':
        let rtn = gamedat_routine_names.get(id);
        if (rtn)
            return rtn.sourceloc;
        break;
    case 'GLOB':
        let glob = gamedat_global_names.get(id);
        if (glob)
            return glob.sourceloc;
        break;
    case 'CONST':
        let con = gamedat_constant_names.get(id);
        if (con)
            return con.sourceloc;
        break;
    }

    return undefined;
}

// Presentation order. Filenames must match game-info!
export const sourcefile_presentation_list: string[] = [
    'zork1.zil',
    '1actions.zil',
    '1dungeon.zil',
    'gmain.zil',
    'gmacros.zil',
    'gglobals.zil',
    'gparser.zil',
    'gsyntax.zil',
    'gverbs.zil',
    'gclock.zil',
];

const winany = (window as any);

export const gamedat_ids = winany.gamedat_ids;

const sourcefile_capkey_map: SourceFileMap = winany.gamedat_sourcefile_capkeymap;
export const gamedat_sourcefile_keymap: SourceFileMap = winany.gamedat_sourcefile_keymap;
export const gamedat_sourcefile_revkeymap: SourceFileMap = winany.gamedat_sourcefile_revkeymap;
export const gamedat_property_nums = winany.gamedat_property_nums as Map<number, PropertyData>;
export const gamedat_property_names = winany.gamedat_property_names as Map<string, PropertyData>;
export const gamedat_attribute_nums = winany.gamedat_attribute_nums as Map<number, AttributeData>;
export const gamedat_attribute_names = winany.gamedat_attribute_names as Map<string, AttributeData>;
export const gamedat_global_nums = winany.gamedat_global_nums as Map<number, GlobalData>;
export const gamedat_global_names = winany.gamedat_global_names as Map<string, GlobalData>;
export const gamedat_globals_sort_index = winany.gamedat_globals_sort_index as GlobalData[];
export const gamedat_globals_sort_alpha = winany.gamedat_globals_sort_alpha as GlobalData[];
export const gamedat_constant_names = winany.gamedat_constant_names as Map<string, ConstantData>;
export const gamedat_object_ids = winany.gamedat_object_ids as Map<number, ObjectData>;
export const gamedat_object_names = winany.gamedat_object_names as Map<string, ObjectData>;
export const gamedat_object_room_ids = winany.gamedat_object_room_ids as Set<number>;
export const gamedat_object_global_ids = winany.gamedat_object_global_ids as Set<number>;
export const gamedat_object_treesort = winany.gamedat_object_treesort as Map<number, number>;
export const gamedat_string_map = winany.gamedat_string_map as Map<number, StringData>;
export const gamedat_dictword_addrs = winany.gamedat_dictword_addrs as Map<number, DictWordData>;
export const gamedat_dictword_adjs = winany.gamedat_dictword_adjs as Map<number, DictWordData>;
export const gamedat_preposition_nums = winany.gamedat_preposition_nums as Map<number, PrepositionData>;
export const gamedat_grammar_verbnums = winany.gamedat_grammar_verbnums as Map<number, GrammarVerbData>;
export const gamedat_grammar_lines = winany.gamedat_grammar_lines as GrammarLineData[];
export const gamedat_grammar_line_addrs = winany.gamedat_grammar_line_addrs as Map<number, GrammarLineData>;
export const gamedat_grammaractionlines = winany.gamedat_grammaractionlines as number[];
export const gamedat_routine_addrs = winany.gamedat_routine_addrs as Map<number, RoutineData>;
export const gamedat_routine_names = winany.gamedat_routine_names as Map<string, RoutineData>;
export const gamedat_table_addrs = winany.gamedat_table_addrs as Map<number, TableData>;
export const gamedat_actions = winany.gamedat_actions as ActionData[];
export const gamedat_sourcefiles = winany.gamedat_sourcefiles as SourceLinesMap;
export const gamedat_distances = winany.gamedat_distances as AllDistanceMap;
export const gamedat_roominfo_names = winany.gamedat_roominfo_names as Map<string, MapRoom>;
export const gamedat_commentary = winany.gamedat_commentary as CommentaryMap;
export const gamedat_commentarymap = winany.gamedat_commentarymap as CommentaryLineMap;


let assetdir = 'visiterp';
if (winany.visizork_options?.assetdir) {
    assetdir = winany.visizork_options?.assetdir;
}

export function getasset(filename?: string) : string
{
    if (!filename)
        return assetdir;
    else
        return assetdir+filename;
}
