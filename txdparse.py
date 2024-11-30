import re

class Routine:
    def __init__(self, addr, argcount):
        self.addr = addr
        self.argcount = argcount

    def __repr__(self):
        return '<Routine %X (%d args)>' % (self.addr, self.argcount,)

class TXDData:
    def __init__(self):
        self.routines = []

    def readdump(self, filename):
        pat_routine = re.compile('^Routine ([0-9a-f]+), ([0-9]+) local[s]?')
        pat_startrtns = re.compile('^\\[Start of code')
        pat_endrtns = re.compile('^\\[End of code')
        with open(filename) as infl:
            rtn = None
            mode = None
            for ln in infl.readlines():
                ln = ln.rstrip()
                if pat_startrtns.match(ln):
                    mode = 'ROUTINES'
                    continue
                if pat_endrtns.match(ln):
                    mode = None
                    continue
                if mode == 'ROUTINES':
                    match = pat_routine.match(ln)
                    if match:
                        addr = int(match.group(1), 16)
                        argcount = int(match.group(2))
                        rtn = Routine(addr, argcount)
                        self.routines.append(rtn)
                        
