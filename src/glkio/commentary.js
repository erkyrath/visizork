'use strict';

var CommentaryClass = function() {

    let visible = false; // or will be when the current animation completes
    let animating = false;

    function show(node, topic)
    {
        if (!node) {
            closepane();
            return;
        }

        $('#commentarycontent').empty();
        $('#commentarycontent').get(0).appendChild(node);

        $('#commentarytitle').text(format_topic(topic));
        
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

    // We have a topic token ("OBJ:ADVENTURER"); return a string suitable
    // for display to humans.
    function format_topic(topic)
    {
        var pos = topic.indexOf(':');
        if (pos < 0) {
            // Internal labels like "ABOUT" don't get displayed at all.
            // TODO: Support metadata in the comment! (I am such a nerd.)
            return '';
        }

        var prefix = topic.slice(0, pos);
        if (prefix == 'SRC') {
            // Hack out the file and line number.
            var val = topic.slice(pos+1);
            pos = val.indexOf('-');
            return val.slice(0, pos).toLowerCase()+'.zil, line ' + val.slice(pos+1);
        }

        return topic.slice(pos+1);
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

