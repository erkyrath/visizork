
/* Parse the JSON data files into a variety of useful maps and lists.

   We do this as soon as the .js files load. There's no DOM work here.
   But note that gamedat.js must be loaded after all the other JSON-data
   .js files!
 */

window.gamedat_global_nums = new Map();
window.gamedat_global_names = new Map();
window.gamedat_globals_sort_index = [];
window.gamedat_globals_sort_alpha = [];
window.gamedat_constant_names = new Map();
window.gamedat_object_ids = new Map();
window.gamedat_object_names = new Map();
window.gamedat_object_room_ids = new Set();
window.gamedat_object_global_ids = new Set();
window.gamedat_object_treesort = new Map();
window.gamedat_string_map = new Map();
window.gamedat_dictword_addrs = new Map();
window.gamedat_dictword_adjs = new Map();
window.gamedat_routine_addrs = new Map();
window.gamedat_routine_names = new Map();
window.gamedat_property_nums = new Map();
window.gamedat_attribute_nums = new Map();

window.gamedat_ids = {};

(function() {
    gamedat_ids.GAMEID = 'zork1-r88-s840726';
    gamedat_ids.MAX_OBJECTS = 250;
    gamedat_ids.MAX_GLOBALS = 158;
    gamedat_ids.DICT_START = 15137;
    gamedat_ids.MAX_DICT_WORD = window.gamedat_dictwords.length;
    gamedat_ids.DICT_WORD_SIZE = 7;
    gamedat_ids.PROP_TABLE_START = 0x0BB8;
    gamedat_ids.PROP_TABLE_END = 0x2270;
    gamedat_ids.C_TABLE_LEN = 180;

    for (let obj of window.gamedat_properties) {
        gamedat_property_nums.set(obj.num, obj);
    }
    
    for (let obj of window.gamedat_attributes) {
        gamedat_attribute_nums.set(obj.num, obj);
    }
    
    for (let obj of window.gamedat_constants) {
        gamedat_constant_names.set(obj.name, obj);
    }

    for (let obj of window.gamedat_globals) {
        if (gamedat_global_names.has(obj.name))
            continue;
        gamedat_global_nums.set(obj.num, obj);
        gamedat_global_names.set(obj.name, obj);
        gamedat_globals_sort_index.push(obj);
        gamedat_globals_sort_alpha.push(obj);
    }
    gamedat_globals_sort_index.sort((g1, g2) => {
        return g1.num - g2.num;
    });
    gamedat_globals_sort_alpha.sort((g1, g2) => {
        if (g1.name < g2.name) return -1;
        if (g1.name > g2.name) return 1;
        return 0;
    });
    
    for (let obj of window.gamedat_objects) {
        gamedat_object_ids.set(obj.onum, obj);
        gamedat_object_names.set(obj.name, obj);
        if (obj.isroom)
            gamedat_object_room_ids.add(obj.onum);

    }
    
    for (let tup of window.gamedat_strings) {
        gamedat_string_map.set(tup[0], { text:tup[1], sourceloc:tup[2] });
    }

    for (let obj of window.gamedat_dictwords) {
        gamedat_dictword_addrs.set(gamedat_ids.DICT_START + obj.num * gamedat_ids.DICT_WORD_SIZE, obj);
        if (obj.flags.includes('A'))
            gamedat_dictword_adjs.set(obj.spec2, obj);
    }
    
    for (let obj of window.gamedat_routines) {
        gamedat_routine_addrs.set(obj.addr, obj);
        gamedat_routine_names.set(obj.name, obj);
    }

    gamedat_ids.ROOMS = gamedat_object_names.get('ROOMS').onum;
    gamedat_ids.GLOBAL_OBJECTS = gamedat_object_names.get('GLOBAL-OBJECTS').onum;
    gamedat_ids.LOCAL_GLOBALS = gamedat_object_names.get('LOCAL-GLOBALS').onum;
    gamedat_ids.ADVENTURER = gamedat_object_names.get('ADVENTURER').onum;
    gamedat_ids.THIEF = gamedat_object_names.get('THIEF').onum;
    gamedat_ids.TROLL = gamedat_object_names.get('TROLL').onum;
    gamedat_ids.STARTROOM = gamedat_object_names.get('WEST-OF-HOUSE').onum;
    gamedat_ids.PSEUDO_OBJECT = gamedat_object_names.get('PSEUDO-OBJECT').onum;

    for (let obj of window.gamedat_objects) {
        /* The global container itself counts as a global for our purposes. */
        if (obj.origparent == gamedat_ids.GLOBAL_OBJECTS || obj.onum == gamedat_ids.GLOBAL_OBJECTS)
            gamedat_object_global_ids.add(obj.onum);
        
        if (obj.isroom)
            gamedat_object_treesort.set(obj.onum, 1);
        else if (obj.name == 'PSEUDO-OBJECT')
            gamedat_object_treesort.set(obj.onum, 3);
        else if (gamedat_object_global_ids.has(obj.onum))
            gamedat_object_treesort.set(obj.onum, 4);
        else
            gamedat_object_treesort.set(obj.onum, 2);
    }
    
})();

