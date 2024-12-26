
window.ROOM_HOLDER = 82;

window.gamedat_object_ids = new Map();
window.gamedat_object_names = new Map();
window.gamedat_object_room_ids = new Set();

(function() {
    for (let obj of window.gamedat_objects) {
        gamedat_object_ids.set(obj.onum, obj);
        gamedat_object_names.set(obj.name, obj);
        if (obj.isroom)
            gamedat_object_room_ids.add(obj.onum);
    }
})();

