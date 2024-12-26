
window.ROOM_HOLDER = 82;

window.gamedat_object_ids = new Map();
window.gamedat_object_names = new Map();
window.gamedat_object_room_ids = new Set();
window.gamedat_object_global_ids = new Set();
window.gamedat_object_treesort = new Map();

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
        else if (gamedat_object_global_ids.has(obj.onum))
            gamedat_object_treesort.set(obj.onum, 3);
        else
            gamedat_object_treesort.set(obj.onum, 2);
    }
})();

