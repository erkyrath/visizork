import React from 'react';

export function GameMap()
{
    return (
        <div className="ScrollXYContent">
            <object className="GameMap" width="1200" height="800" type="image/svg+xml" data="css/zorkmap.svg" />
        </div>
    );
}
