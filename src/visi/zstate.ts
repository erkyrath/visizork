
export type ZObject = {
    onum: number;
    parent: number;
    child: number;
    sibling: number;
}

export type ZState = {
    objects: ZObject[];
};

export function zstate_empty() : ZState
{
    return {
	objects: [],
    };
}
