/*

Gnusto runner (modified for GlkOte display)
=============

Copyright (c) 2011 The Parchment Contributors
BSD licenced
http://code.google.com/p/parchment

GlkOte modifications by Andrew Plotkin
*/

// A Gnusto runner
var GnustoRunner = Object.subClass({

    init: function( env )
    {
        this._classname = 'GnustoRunner(g)';
        var self = this;
        var engine = window.engine = this.e = new GnustoEngine( function(msg) { console.log( msg ); } );

        this.io = new GlkIOClass( env, this );
        
    },
    
    // Handler for events from Parchment
    fromParchment: function( event )
    {
        var code = event.code;
        var engine = this.e;
        var run;
        
        // Load the story file
        if ( code == 'load' )
        {
            engine.loadStory( event.data );
        }

        // (Re)start the engine
        if ( code == 'restart' )
        {
            this.orders = [];
            // The header bit we pass in is "game sets to force all-monospace"
            this.ui = new ZVMUI( this, engine.getByte( 0x11 ) & 0x02 );
            
            this.orders = [];
            // calls GlkOte.init()
            this.io.init();
        }
        
        // Save a savefile
        if ( code == 'save' )
        {
            engine.answer( 0, event.result || 1 );
            run = 1;
        }
        
        // Restore a savefile
        if ( code == 'restore' )
        {
            if ( !this.ui )
            {
                this.restart();
            }
            if ( event.data )
            {
                engine.loadSavedGame( event.data )
            }
            else
            {
                engine.answer( 0, 0 );
            }
            run = 1;
        }
        
        if ( run )
        {
            this.run();
        }
    },

    //### currently not used for startup!
    restart: function()
    {
        var engine = this.e;
        var io = this.io;

        if (!io.glkote.inited()) {
            // calls GlkOte.init()
            io.init();
        }
        
        // Header variables
        //### should be v4+
        var winwidth = io.get_status_width();
        engine.setByte( 255, 0x20 );
        engine.setByte( winwidth, 0x21 );
        engine.setWord( winwidth, 0x22 );
        engine.setWord( 255, 0x24 );
        
        // Set up the ifvms.js ZVMUI
        //###io.target = io.container.empty();
        this.orders = [];
        // The header bit we pass in is "game sets to force all-monospace"
        this.ui = new ZVMUI( this, engine.getByte( 0x11 ) & 0x02 );
        //### this is not currently a thing
        io.event( this.orders );
        this.orders = [];
    },

    // Handle Gnusto's non-StructIO friendly IO protocol
    run: function()
    {
        var engine = this.e;
        var ui = this.ui;
        var text, effect, effect1, effect2, stop, i;
        
        this.orders = [];
        engine.reset_vm_report();
        
        while ( !stop )
        {
            try {
                engine.run();
            }
            catch (ex) {
                this.io.error(ex);
                break;
            }

            text = engine.consoleText();
            if ( text )
            {
                ui.buffer += text;
            }

            effect = '"' + engine.effect( 0 ) + '"';
            effect1 = engine.effect( 1 );
            effect2 = engine.effect( 2 );

            if ( effect == GNUSTO_EFFECT_INPUT )
            {
                stop = 1;
                ui.flush();
                this.orders.push({
                    code: 'read',
                    target: this.currentwin,
                    maxlen: engine.effect( 3 )
                });
            }
            if ( effect == GNUSTO_EFFECT_INPUT_CHAR )
            {
                stop = 1;
                this.orders.push({
                    code: 'char'
                });
            }
            if ( effect == GNUSTO_EFFECT_SAVE )
            {
                stop = 1;
                engine.saveGame();
                this.toParchment({
                    code: 'save',
                    data: engine.saveGameData()
                });
            }
            if ( effect == GNUSTO_EFFECT_RESTORE )
            {
                stop = 1;
                this.toParchment({ code: 'restore' });
            }
            if ( effect == GNUSTO_EFFECT_QUIT )
            {
                stop = 1;
            }
            if ( effect == GNUSTO_EFFECT_RESTART )
            {
                engine.resetStory();
                this.restart();
                ui = this.ui;
            }
            if ( effect == GNUSTO_EFFECT_FLAGS_CHANGED )
            {
                ui.flush();
                ui.mono = ( ui.mono & 0xFD ) | engine.m_printing_header_bits & 0x2;
            }
            if ( effect == GNUSTO_EFFECT_STYLE )
            {
                if ( effect1 < 0 )
                {
                    ui.set_colour( effect2, engine.effect(3) );
                }
                else
                {
                    ui.set_style( effect1 );
                }
            }
            if ( effect == GNUSTO_EFFECT_SPLITWINDOW )
            {
                ui.split_window( effect1 );
            }
            if ( effect == GNUSTO_EFFECT_SETWINDOW )
            {
                ui.set_window( effect1 );
            }
            if ( effect == GNUSTO_EFFECT_ERASEWINDOW )
            {
                ui.erase_window( effect1 );
            }
            if ( effect == GNUSTO_EFFECT_ERASELINE )
            {
                ui.erase_line( effect1 );
            }
            if ( effect == GNUSTO_EFFECT_SETCURSOR )
            {
                ui.set_cursor( effect1, effect2 );
            }
            if ( effect == GNUSTO_EFFECT_GETCURSOR )
            {
                stop = 1;
                ui.get_cursor( effect1 );
            }
            if ( effect == GNUSTO_EFFECT_PRINTTABLE )
            {
                for ( i = 0; i < effect1; i++ )
                {
                    ui.buffer += '\n' + engine.effect( 2 + i );
                }
            }
        }
        
        // Flush the buffer
        ui.flush();
        
        // Flush the status if we need to
        if ( ui.status.length )
        {
            this.orders.push({
                code: 'stream',
                to: 'status',
                data: this.ui.status
            });
            ui.status = [];
        }

        // Notify listeners that the game state has changed
        window.dispatchEvent(new Event('zmachine-update'));
        
        // Return the orders to GlkIO
        return this.orders;
    },
    
    // Dummy func needed by get_cursor()
    act: function(){}

});
