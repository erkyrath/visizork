
window.gamedat_object_ids = new Map();
window.gamedat_object_names = new Map();

(function() {
    for (let tup of window.gamedat_objects) {
        let obj = {
            onum: tup[0],
            name: tup[1],
            isroom: (tup[2] == 'ROOM'),
            desc: tup[3],
            sourceloc: tup[4],
        };
        gamedat_object_ids.set(obj.onum, obj);
        gamedat_object_names.set(obj.name, obj);
    }
})();

