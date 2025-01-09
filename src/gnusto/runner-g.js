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
        this.commentary = new CommentaryClass();
    },

    load: function ( data )
    {
        engine.loadStory( data );
    },

    createSaveFiles: function ( files )
    {
        for (var dat of files) {
            this.io.create_save_file(dat.name, dat.data);
        }
    },

    startGame: function ()
    {
        this.orders = [];
        // The header bit we pass in is "game sets to force all-monospace"
        this.ui = new ZVMUI( this, engine.getByte( 0x11 ) & 0x02 );

        // The ZVMUI constructor adds some orders for creating the game
        // windows. But we don't rely on those (the IO layer will just
        // do it) so we clear the orders here.
        this.orders = [];
        
        // Start the IO layer. This calls GlkOte.init(), which runs the first
        // game turn.
        this.io.init();
    },

    // Execute one game turn (until the game reaches an input point).
    // Return the game's output in the form of a Gnusto-style orders
    // array.
    // This is called from GlkIO.accept(), which is called to launch the game
    // and then again for every game input.
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
                this.orders.push({
                    code: 'save',
                    data: engine.saveGameData()
                });
            }
            if ( effect == GNUSTO_EFFECT_RESTORE )
            {
                stop = 1;
                this.orders.push({
                    code: 'restore'
                });
            }
            if ( effect == GNUSTO_EFFECT_QUIT )
            {
                stop = 1;
                this.orders.push({
                    code: 'quit'
                });
            }
            if ( effect == GNUSTO_EFFECT_RESTART )
            {
                this.io.error('RESTART effect not used');
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

        // We close the commentary pane on each input.
        this.commentary.hide();

        // Notify listeners that the game state has changed
        window.dispatchEvent(new Event('zmachine-update'));
        
        // Return the orders to GlkIO
        return this.orders;
    },
    
    // Dummy func needed by get_cursor()
    act: function(){}

});
