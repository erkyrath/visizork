'use strict';

var CommentaryClass = function() {

    let visible = false; // or will be when the current animation completes
    let animating = false;

    function show(node)
    {
        if (!node) {
            closepane();
            return;
        }

        $('#commentarycontent').empty();
        $('#commentarycontent').get(0).appendChild(node);
        
        openpane();
    }

    function openpane()
    {
        let panel = $('#commentarypane');
        if (!panel.length)
            return;

        if (visible) {
            return;
        }

        panel.animate({
            opacity: 1
        }, {
            duration: 200,
            start: function() {
                visible = true;
                animating = true;
                panel.show();
            },
            step: function(now, fx) {
                let xval = Math.floor(400-now*400);
                panel.css('transform', 'translateX('+xval+'px)');
            },
            complete: function() {
                panel.css('transform', '');
                animating = false;
            },
        })
    }
    
    function closepane()
    {
        let panel = $('#commentarypane');
        if (!panel.length)
            return;
        
        if (!visible) {
            return;
        }

        panel.animate({
            opacity: 0
        }, {
            duration: 200,
            start: function() {
                visible = false;
                animating = true;
            },
            step: function(now, fx) {
                let xval = Math.floor(400-now*400);
                panel.css('transform', 'translateX('+xval+'px)');
            },
            complete: function() {
                panel.hide();
                panel.css('transform', '');
                animating = false;
            },
        })
    }

    $('#commentaryclose').on('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        closepane();
    });

    return {
        _classname: 'Commentary',
        show: show,
        hide: closepane,
    };
}

