'use strict';

var CommentaryClass = function() {

    $('#commentaryclose').on('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        console.log('### close');
    });
}

