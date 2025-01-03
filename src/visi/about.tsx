import React from 'react';

export function AboutPage()
{
    let curroom = 'WEST-OF-HOUSE'; //###
    let firstobj = 'DOOR'; //###
    
    return (
        <div className="ScrollContent">
            <div className="AboutPage">
                <h2>What's going on?</h2>
                <p>
                    You are playing Zork, the classic Infocom text adventure.
                    And you are watching the Z-machine execute the game,
                    live, as you play.
                </p>
                <p>
                    Type commands in the left pane. (If you're not familiar
                    with Zork,{' '}
                    <a target="_blank" href="https://pr-if.org/doc/play-if-card/">here's
                    a quick intro</a>.)
                    As the game responds, the panes on the right will display
                    the current game state and the source code that is
                    executing.
                </p>
                <p>
                    Look at the <a href="#">World</a> tab for a start.
                    This shows every object and room in the game.
                    You, the Adventurer, are in the topmost room:{' '}
                    <code>{ curroom }</code>.
                    Listed with you are the objects you
                    can see. (Try "<code>EXAMINE { firstobj }</code>"!)
                    If you pick up an object, it will shift to be listed
                    under the <code>ADVENTURER</code>.
                </p>
                <p>
                    The other tabs display other aspects of the Z-machine.
                    {' '}<a href="#">Trace</a> shows the functions called in
                    the most recent turn, and what they printed.
                    {' '}<a href="#">Globals</a> shows the global variable
                    state of the world. (Objects have property variables
                    as well, which you can view from the World tab.)
                </p>
                <p>
                    Click on any function, object, or variable to see its
                    definition in the source code.
                </p>
            </div>
        </div>
    );
}
