'use strict';

/*

Quetzal Common Save-File Format
===============================

Copyright (c) 2011 The ifvms.js team
BSD licenced
http://github.com/curiousdannii/ifvms.js

*/

// A savefile
var Quetzal = IFF.subClass({
    // Parse a Quetzal savefile, or make a blank one
    init: function(bytes)
    {
        this._super(bytes);
        if (bytes)
        {
            // Check this is a Quetzal savefile
            if (this.type != 'IFZS')
                throw new Error('Not a Quetzal savefile');

            // Go through the chunks and extract the useful ones
            for (var i = 0, l = this.chunks.length; i < l; i++)
            {
                var type = this.chunks[i].type, data = this.chunks[i].data;

                // Memory and stack chunks. Overwrites existing data if more than one of each is present!
                if (type == 'CMem' || type == 'UMem')
                {
                    this.memory = data;
                    this.compressed = (type == 'CMem');
                }
                else if (type == 'Stks')
                    this.stacks = data;

                // Story file data
                else if (type == 'IFhd')
                {
                    this.release = data.slice(0, 2);
                    this.serial = data.slice(2, 8);
                    // The checksum isn't used, but if we throw it away we can't round-trip
                    this.checksum = data.slice(8, 10);
                    this.pc = data[10] << 16 | data[11] << 8 | data[12];
                }
            }
        }
    },

    // Write out a savefile
    write: function()
    {
        // Reset the IFF type
        this.type = 'IFZS';

        // Format the IFhd chunk correctly
        var pc = this.pc;
        var ifhd = new Array(13);
        ifhd[0] = this.release[0];
        ifhd[1] = this.release[1];
        ifhd[2] = this.serial[0];
        ifhd[3] = this.serial[1];
        ifhd[4] = this.serial[2];
        ifhd[5] = this.serial[3];
        ifhd[6] = this.serial[4];
        ifhd[7] = this.serial[5];
        ifhd[8] = this.checksum[0];
        ifhd[9] = this.checksum[1];
        ifhd[10] = (pc >> 16) & 0xFF;
        ifhd[11] = (pc >> 8) & 0xFF;
        ifhd[12] = pc & 0xFF;

        // Add the chunks
        this.chunks = [
            {type: 'IFhd', data: ifhd},
            {type: (this.compressed ? 'CMem' : 'UMem'), data: this.memory},
            {type: 'Stks', data: this.stacks}
        ];

        // Return the byte array
        return this._super();
    }
});
