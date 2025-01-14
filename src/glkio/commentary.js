'use strict';

/* This module displays and hides the commentary pane, with a tiny bit
   of animation.
 */

var CommentaryClass = function() {

    let visible = false; // or will be when the current animation completes
    let animating = false;

    /* Display the commentary pane. The node must be a DOM node containing
       the text to display. The topitc argument is used in the pane's
       title bar. */
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

    /* Open the commentary pane, if it isn't already. This should be safe
       to call even if the pane is already animating closed or open. */
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
    
    /* Close the commentary pane, if it isn't already. This should be safe
       to call even if the pane is already animating closed or open. */
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

    /* We have a topic token ("OBJ:ADVENTURER"); return a string suitable
       for display in the title bar.
    */
    function format_topic(topic)
    {
        if (!topic)
            return '';
        
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

