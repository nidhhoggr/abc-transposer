const assert = require("assert");
const fs = require("fs");

const at = require("../index.js");

describe('when given isMelody lines', () => {

  it('Should return true with 1:', async () => { 
   
    const line = "1: a b c d ";

    const is = at.isMelody({line});

    assert(is == true, "1: should return true");
  });


  it('Should return false with K:', async () => { 
   
    const line = "K: a b c d ";

    const is = at.isMelody({line});

    assert(is == false, "K: should return false");
  });

  it('Should return true with K when included:', async () => { 
   
    const line = "K: a b c d ";

    const is = at.isMelody({line, including: "K"});

    assert(is == true);
  });

  it('Should return false with A:', async () => { 
   
    const line = "A: a b c d ";

    const is = at.isMelody({line});

    assert(is == false);
  });

});

describe('when converting to notenames', () => {
  const abc = fs.readFileSync('./test/schottisFranJamtland.abc', 'utf8');
  const toProcess = abc.toString();
  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/notenames.txt', 'utf8');
    const actual = at.toNoteNames({toProcess});
    assert(expected.toString() == actual);
  });
});

describe('when converting to fiddletabs', () => {
  const abc = fs.readFileSync('./test/schottisFranJamtland.abc', 'utf8');
  const toProcess = abc.toString();
  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/fiddletabs.txt', 'utf8');
    const actual = at.toFiddleTabs({toProcess});
    assert(expected.toString() == actual);
  });
});

describe('when trasposing up', () => {
  const abc = fs.readFileSync('./test/schottisFranJamtland.abc', 'utf8');
  const toProcess = abc.toString();
  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/transposeup.txt', 'utf8');
    const actual = at.transposeUp({toProcess});
    assert(expected.toString() == actual);
  });
});

describe('when trasposing down', () => {
  const abc = fs.readFileSync('./test/schottisFranJamtland.abc', 'utf8');
  const toProcess = abc.toString();
  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/transposedown.txt', 'utf8');
    const actual = at.transposeDown({toProcess});
    assert(expected.toString() == actual);
  });
});


describe('when converting B to H', () => {
  const abc = fs.readFileSync('./test/schottisFranJamtland.abc', 'utf8');
  const toProcess = abc.toString();
  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/btoh.txt', 'utf8');
    const actual = at.bToH({toProcess});
    assert(expected.toString() == actual);
    describe('when converting H to B', () => {
      it('Should convert them correctly', () => {
        const actual2 = at.hToB({toProcess: actual});
        assert(actual2 == toProcess);
      });
    });
  });
});

describe('when converting to Do Re Mi', () => {
  const toProcess = `X:1
T:Testing Do Re Mi Conversion
M:2/2
L:1/8
Q:1/2=80 "BPM=80"
K:Ddor
D{ED}>C"C" D>D"D" F2"F" F>-G"G" | A>G B>G A2"A" (A>B"B" | c)>d- c>B G2 G2- | G>B- d>A E2"E" F2 |
`;

  it('Should convert them correctly', () => {
    const expected = fs.readFileSync('./test/expected/todoremi.txt', 'utf8');
    const actual = at.toDoReMi({toProcess});
    assert(expected.toString() == actual);
    describe('when converting from Do Re Mi', () => {
      it('Should convert them correctly', () => {
        const actual2 = at.fromDoReMi({toProcess: actual});
        assert(actual2 == toProcess);
      });
    });
  });
});

