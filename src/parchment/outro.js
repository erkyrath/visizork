/*

Parchment load scripts
======================

Copyright (c) 2008-2011 The Parchment Contributors
BSD licenced
http://code.google.com/p/parchment

*/
(function(window, $){

var parchment = window.parchment;

// A story file
var StoryClass = IFF.subClass({
    // Parse a zblorb or naked zcode story file
    init: function(data, story_name)
    {
        this.title = story_name;

        if (true)
        {
            //this.filetype = 'zcode';
            this._super();
            this.chunks.push({
                type: 'ZCOD',
                data: data
            });
            this.data = data;
        }
    }
});

function fromRunner( runner, event )
{
    var code = event.code;
    
    if ( code == 'save' )
    {
        console.log('### save handler', event);
    }
    
    if ( code == 'restore' )
    {
        console.log('### restore handler', event);
    }
    
    runner.fromParchment( event );
}

// Load Parchment, start it all up!
$(function()
{
    // Check for any customised options
    if ( window.parchment_options )
    {
        $.extend( parchment.options, parchment_options );
    }
    
    var options = parchment.options;
    var storyfile = parchment.options.default_story;
    var responseArray = window.gameimage;

    var runner = window.runner = new GnustoRunner(parchment.options);

    runner.toParchment = function( event ) { fromRunner( runner, event ); };
    
    // Load it up!
    runner.fromParchment({
        code: 'load',
        data: ( new StoryClass( responseArray ) ).data
    });
    
    runner.fromParchment({ code: 'restart' });

    // If we have the React app module loaded, launch that too.
    if (window.bundle) {
        window.bundle.init(runner.e);
    }
});

})( this, jQuery );
