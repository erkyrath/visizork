/*

Parchment
=========

Built: BUILDDATE

Copyright (c) 2008-2011 The Parchment Contributors
BSD licenced
http://code.google.com/p/parchment

*/


// The home for Parchment to live in
var parchment = {

    // The default parchment options
    options: {
        // A selector for the top HTML element which we will have complete control over
        container: '#parchment',
        
        // Should no ?story= be given, run this
        // May be an array, in which case [0] is the .z5/.zblorb and [1] is a backup legacy .js file
        //default_story: [ 'stories/troll.z5', 'stories/troll.z5.js' ],
        
        // Where shall we find the lib .js files?
        lib_path: 'lib/',
        
        // Don't allow people to specify additional options in the query string
        //lock_options: 0,
        
        // Lock Parchment so it will only run the default story, which must be provided!
        //lock_story: 0,
        
        // Set to 0 if you don't want Parchment to overwrite your <title>       
        page_title: 1,
        
        // Front page panels to display if no default story
        panels: [ 'search', 'url', 'about' ],
        
        // URL of proxy server to use for files we can't directly load
        proxy_url: 'http://zcode.appspot.com/proxy/'
    },

    // Classes etc
    lib: {}
};
