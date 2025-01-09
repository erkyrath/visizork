window.gamedat_commentary = {"ABOUT":["Welcome to the commentary track!"],"OBJ:ADVENTURER":["Yes, the player\u2019s printed name is \u201ccretin\u201d, although the game rarely says so. (The death message for ",["code","BURN BOOK"]," mentions it too.) This sort of sarcastic insult hasn\u2019t aged too well, but MIT culture had a lot of it. Compare ",["loccom","GLOB:WINNER"],", and also the old MIT ",["extlink","Jargon File","https://jargon-file.org/archive/jargon-1.0.0.33.dos.txt"],".",["br"],"Note that if you refer to ",["code","ME"]," (or ",["code","CRETIN"],"), you get the ",["loccom","OBJ:ME"]," global object, not the ",["code","ADVENTURER"],"."],"OBJ:ME":["A global object which is always in scope. Commands referring to ",["code","ME"]," hit this, rather than ",["loccom","OBJ:ADVENTURER"],", which is a stub that moves around the map.",["br"],"Because of this, parser messages mostly refer to you as \u201cyou\u201d, even though the ",["code","ADVENTURER"],"\u2019s printed name is \u201ccretin\u201d. See ",["loccom","OBJ:ADVENTURER"],"."],"GLOB:PLAYER":[["code","PLAYER"]," is always the ",["loc","OBJ:ADVENTURER"],". Compare ",["loccom","GLOB:WINNER"],"."],"GLOB:WINNER":[["code","WINNER"]," is the actor in the current command. (Compare ",["loc","GLOB:PLAYER"],".)",["br"],["code","WINNER"]," is usually ",["loc","OBJ:ADVENTURER"],", but for a command like ",["code","ROBOT, GO EAST"]," it shifts to the named NPC. (But Zork 1 has no commandable NPCs, so this doesn\u2019t come up.)",["br"],"\u201cWinner\u201d is just as sarcastic as \u201ccretin\u201d, but from the other side."],"GLOB:HERE":["The location of the ",["loc","GLOB:WINNER"],"."],"OBJ:SONGBIRD":["The songbird is always present but never in reach. Except when using the ",["loc","OBJ:CANARY"],", and even then the bird flies away before you can interact with it."]};
