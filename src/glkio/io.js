'use strict';

var GlkIOClass = function(env, runner) {

    var all_options = env;
    var runner = runner;
    var glkote = GlkOte;
    var content_metrics = null;

    var generation = 0;

    function init()
    {
        var subenv = { ...env, accept:accept };
        glkote.init(subenv);
    }

    function accept(obj)
    {
        var engine = runner.e;
        var layout_dirty = false;
        var run = false;
        var orders = null;
        var echoline = null;
        
        if (obj.type == 'init') {
            content_metrics = complete_metrics(obj.metrics);
            layout_dirty = true;
            run = true;
        }
        else if (obj.type == 'arrange') {
            content_metrics = complete_metrics(obj.metrics);
            layout_dirty = true;
            run = false;
        }
        else if (obj.type == 'line') {
            engine.answer(0, '\n');
            engine.answer(1, obj.value);
            echoline = obj.value;
            run = true;
        }
        else {
            console.log('### unhandled accept', obj);
        }

        /* If this is initial startup or a player input, run the engine
           a turn. */
        if (run) {
            orders = runner.run();
        }

        var newgen = obj.gen + 1;
        var update = {
            type: 'update',
            gen: newgen,
        };

        /* If this is initial startup or a rearrange event, recompute
           the window sizes. */
        if (layout_dirty) {
            update.windows = build_windows();
        }

        var gridcontent = [];
        var buffercontent = [];
        var newinput = null;
        var clearbuffer = false;

        if (echoline != null) {
            var windat = {
                append: true,
                content: [
                    { style:'input', text:echoline+'\n' },
                ],
            };
            buffercontent.push(windat);
        }
        
        if (orders !== null) {
            for (var ord of orders) {
                if (ord.code == 'stream' && ord.to != 'status') {
                    var style = 'normal';
                    if (ord.css && ord.css['font-style'] == 'italic') {
                        style = 'emphasized';
                    }
                    if (ord.css && ord.css['font-weight'] == 'bold') {
                        style = 'subheader';
                    }
                    if (ord.node == 'tt') {
                        style = 'preformatted';
                    }
                    var append = true;
                    for (var ln of ord.text.split('\n')) {
                        if (append && !ln.length) {
                            append = false;
                            continue;
                        }
                        var windat = {};
                        if (ln.length) {
                            windat.content = [
                                { style:style, text:ln },
                            ];
                        }
                        if (append)
                            windat.append = true;
                        buffercontent.push(windat);
                        append = false;
                    }
                }

                if (ord.code == 'clear') {
                    // Could check "name:main" here, but it's not useful
                    clearbuffer = true;
                    buffercontent.length = 0;
                }
                
                if (ord.code == 'read') {
                    newinput = {
                        id: 1, gen: newgen, type: 'line', maxlen: ord.maxlen,
                    };
                }
                
                if (ord.code == 'char') {
                    newinput = {
                        id: 1, gen: newgen, type: 'char',
                    };
                }
            }
        }

        /* Rebuild the status line if the game updated *or* the window
           changed size. */
        if (layout_dirty || run) {
            //### version 3 only
            var statusline = engine.getStatusLine(get_status_width());
            
            gridcontent.push({
                line: 0,
                content: [
                    { style:'normal', text:statusline },
                ],
            });
        }

        if (buffercontent.length || gridcontent.length) {
            update.content = [];

            if (buffercontent.length) {
                var dat = { id: 1, text: buffercontent, };
                if (clearbuffer)
                    dat.clear = true;
                update.content.push(dat);
            }

            if (gridcontent.length) {
                update.content.push(
                    { id: 2, lines: gridcontent }
                );                
            }
        }

        if (newinput) {
            update.input = [ newinput ];
        }

        layout_dirty = false;
        
        glkote.update(update);
        
    }

    function build_windows()
    {
        var metrics = content_metrics;
        var windows = [];

        var statusheight = 1;
        var storytop = (metrics.outspacingy
            + (statusheight*metrics.gridcharheight+metrics.gridmarginy)
            + metrics.inspacingy);
        
        windows.push({
            id: 1,
            type: 'buffer',
            rock: 11,
            left: metrics.outspacingx,
            top: storytop,
            width: metrics.width-(2*metrics.outspacingx),
            height: metrics.height-(storytop+metrics.outspacingy),
        });

        windows.push({
            id: 2,
            type: 'grid',
            rock: 22,
            left: metrics.outspacingx,
            top: metrics.outspacingy,
            width: metrics.width-(2*metrics.outspacingx),
            height: statusheight*metrics.gridcharheight + metrics.gridmarginy,
            gridwidth: Math.floor((metrics.width-metrics.gridmarginx) / metrics.gridcharwidth),
            gridheight: statusheight,
        });

        return windows;
    }

    function get_status_width()
    {
        if (content_metrics) {
            var metrics = content_metrics;
            return Math.floor((metrics.width-metrics.gridmarginx) / metrics.gridcharwidth);
        }
        return 80;
    }
      
    /* Given a partial metrics object, return one with all the required
       values. Missing values will default to 0 or the standard inherited
       terms. (E.g., if "inspacingx" is missing it will default to
       "inspacing", then "spacing", then 0. See measure_window() in 
       glkote.js or data_metrics_parse() in RemGlk.)

       All values in the given object will be copied over; defaulting only
       applies to missing values from the required set.
    */
    function complete_metrics(metrics) {

        // Default values if absolutely nothing is specified.
        var res = {
            width: 80,
            height: 50,
            
            gridcharwidth: 1,
            gridcharheight: 1,
            buffercharwidth: 1,
            buffercharheight: 1,
            
            gridmarginx: 0,
            gridmarginy: 0,
            buffermarginx: 0,
            buffermarginy: 0,
            graphicsmarginx: 0,
            graphicsmarginy: 0,
            
            outspacingx: 0,
            outspacingy: 0,
            inspacingx: 0,
            inspacingy: 0,
        };

        // Various ways of specifying defaults.
        var val;

        val = metrics.charwidth;
        if (val !== undefined) {
            res.gridcharwidth = val;
            res.buffercharwidth = val;
        }
        val = metrics.charheight;
        if (val !== undefined) {
            res.gridcharheight = val;
            res.buffercharheight = val;
        }

        val = metrics.margin;
        if (val !== undefined) {
            res.gridmarginx = val;
            res.gridmarginy = val;
            res.buffermarginx = val;
            res.buffermarginy = val;
            res.graphicsmarginx = val;
            res.graphicsmarginy = val;
        }    

        val = metrics.gridmargin;
        if (val !== undefined) {
            res.gridmarginx = val;
            res.gridmarginy = val;
        }
        
        val = metrics.buffermargin;
        if (val !== undefined) {
            res.buffermarginx = val;
            res.buffermarginy = val;
        }
        
        val = metrics.graphicsmargin;
        if (val !== undefined) {
            res.graphicsmarginx = val;
            res.graphicsmarginy = val;
        }

        val = metrics.marginx;
        if (val !== undefined) {
            res.gridmarginx = val;
            res.buffermarginx = val;
            res.graphicsmarginx = val;
        }
        
        val = metrics.marginy;
        if (val !== undefined) {
            res.gridmarginy = val;
            res.buffermarginy = val;
            res.graphicsmarginy = val;
        }

        val = metrics.spacing;
        if (val !== undefined) {
            res.inspacingx = val;
            res.inspacingy = val;
            res.outspacingx = val;
            res.outspacingy = val;
        }

        val = metrics.inspacing;
        if (val !== undefined) {
            res.inspacingx = val;
            res.inspacingy = val;
        }

        val = metrics.outspacing;
        if (val !== undefined) {
            res.outspacingx = val;
            res.outspacingy = val;
        }

        val = metrics.spacingx;
        if (val !== undefined) {
            res.inspacingx = val;
            res.outspacingx = val;
        }

        val = metrics.spacingy;
        if (val !== undefined) {
            res.inspacingy = val;
            res.outspacingy = val;
        }
        
        // Copy over all the supplied fields. These override the defaults above.
        res = Object.assign(res, metrics);
        
        return res;
    }
    
    return {
        _classname: 'GlkIO',
        glkote: glkote,
        error: glkote.error,

        init: init,
        get_status_width: get_status_width,
    };
};
