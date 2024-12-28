
window.gamedat_object_ids = new Map();
window.gamedat_object_names = new Map();
window.gamedat_object_room_ids = new Set();
window.gamedat_object_global_ids = new Set();
window.gamedat_object_treesort = new Map();
window.gamedat_string_map = new Map();

window.gamedat_ids = {};

(function() {
    for (let obj of window.gamedat_objects) {
        gamedat_object_ids.set(obj.onum, obj);
        gamedat_object_names.set(obj.name, obj);
        if (obj.isroom)
            gamedat_object_room_ids.add(obj.onum);
        //### unhardcode
        /* The global container itself counts as a global for our purposes. */
        if (obj.origparent == 247 || obj.onum == 247)
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

    for (let tup of window.gamedat_strings) {
        gamedat_string_map.set(tup[0], { text:tup[1], sourceloc:tup[2] });
    }

    gamedat_ids.ROOMS = gamedat_object_names.get('ROOMS').onum;
    gamedat_ids.GLOBAL_OBJECTS = gamedat_object_names.get('GLOBAL-OBJECTS').onum;
    gamedat_ids.LOCAL_GLOBALS = gamedat_object_names.get('LOCAL-GLOBALS').onum;
    gamedat_ids.ADVENTURER = gamedat_object_names.get('ADVENTURER').onum;
    gamedat_ids.STARTROOM = gamedat_object_names.get('WEST-OF-HOUSE').onum;
    gamedat_ids.PSEUDO_OBJECT = gamedat_object_names.get('PSEUDO-OBJECT').onum;

})();

