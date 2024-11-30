import re

class String:
    @staticmethod
    def unescape(text):
        text = text.replace('\\n', '\n')
        text = text.replace('\\t', '\t')
        text = text.replace('\\"', '\"')
        if '\\' in text:
            raise Exception('unknown escape')
        return text

    def __init__(self, addr, index, text):
        self.addr = addr
        self.index = index
        self.text = text

class Routine:
    def __init__(self, addr, argcount):
        self.addr = addr
        self.argcount = argcount

    def __repr__(self):
        return '<Routine %X (%d args)>' % (self.addr, self.argcount,)

class TXDData:
    def __init__(self):
        self.routines = []
        self.strings = []

    def readdump(self, filename):
        pat_routine = re.compile('^Routine ([0-9a-f]+), ([0-9]+) local[s]?')
        pat_startrtns = re.compile('^\\[Start of code')
        pat_endrtns = re.compile('^\\[End of code')
        pat_text = re.compile('^([0-9a-f]+): S([0-9]+)[ ]+\"(.*)\"$')
        pat_starttext = re.compile('^\\[Start of text')
        pat_endtext = re.compile('^\\[End of text')
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
                if pat_starttext.match(ln):
                    mode = 'TEXT'
                    continue
                if pat_endtext.match(ln):
                    mode = None
                    continue
                if mode == 'ROUTINES':
                    match = pat_routine.match(ln)
                    if match:
                        addr = int(match.group(1), 16)
                        argcount = int(match.group(2))
                        rtn = Routine(addr, argcount)
                        self.routines.append(rtn)
                if mode == 'TEXT':
                    match = pat_text.match(ln)
                    if match:
                        addr = int(match.group(1), 16)
                        index = int(match.group(2))
                        text = String.unescape(match.group(3))
                        st = String(addr, index, text)
                        self.strings.append(st)
                        
