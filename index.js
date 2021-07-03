const informationFields = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

const doReMiMapping = {
  "C": "Do",
  "D": "Ré",
  "E": "Mi",
  "F": "Fa",
  "G": "Sol",
  "A": "La",
  "B": "Si",
  "H": "Si",
}

const possibleKeys = ["A","B","C","D","E","F","G"];

module.exports = {
  isMelody,
  toNoteNames,
  toFiddleTabs,
  transposeUp,
  transposeDown,
  bToH,
  hToB,
  toDoReMi,
  fromDoReMi,
  replaceCharWith
}

function objectFlip(obj) {
  const ret = {};
  Object.keys(obj).forEach(key => {
    ret[obj[key]] = key;
  });
  return ret;
}

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substring(0,index) + chr + str.substring(index+1);
}

function isMelody({line, including}) {
  if (line.includes("%abc-charset")) return false;
  const prefix = line.substr(0,2);
  if (including && prefix == including.concat(":")) return true;
  return !(prefix.indexOf(":") == 1 && informationFields.includes(prefix[0])); 
}

function prepareProcessable({toProcess}) {
  const escaped = escape(toProcess);
  //this was used everywhere but has no effect as its overwritten
  //let lines = escaped.split("%0D%0A");
  let lines = escaped.split("%0A");
  return lines;
}

function toNoteNames({toProcess, newLine = "\n"}) {
  const lines = prepareProcessable({toProcess});
  let i;
  for (i=0; i < lines.length; ++i) {
    lines[i] = unescape(lines[i]);
    if(isMelody({line: lines[i]})) {
      let grifferaus = lines[i].replace(/("([^"]+)")/gi, "");
      grifferaus = grifferaus.replace(/("([^!]+)")/gi, ""); 
      grifferaus = grifferaus.replace(/!(.*)!/gi, "");
      grifferaus = grifferaus.replace(/O/gi, "");

      const lineChars = grifferaus.split("");
      let papp = "";
      let x;
      for(x = 0; x<lineChars.length; ++x) {
        const moin = lineChars[x].search(/[A-Z]|[a-z]/g);
        if(moin != -1) {
          if(lineChars[x+1] != "\"") {
            papp = papp + lineChars[x] + " ";
          }
        }
      }
      if (papp.length > 0) lines[i] = lines[i] + newLine + "w:" + papp;
    }
  }

  const insfeld = lines.join("\n");
  return insfeld;
}


function toFiddleTabs({toProcess, newLine = "\n"}) {
  const lines = prepareProcessable({toProcess});
  let i;
  for (i=0; i < lines.length; ++i) {
    lines[i] = unescape(lines[i]);
    if(isMelody({line: lines[i]})) {
      let grifferaus = lines[i].replace(/("([^"]+)")/gi, "");
      grifferaus = grifferaus.replace(/("([^!]+)")/gi, ""); 
      grifferaus = grifferaus.replace(/!(.*)!/gi, "");
      grifferaus = grifferaus.replace(/O/gi, "");

      const lineChars = grifferaus.split("");
      let papp = "";
      let x;
      for(x = 0; x<lineChars.length; ++x) {
        const moin = lineChars[x].search(/[A-Z]|[a-z]/g);
        if(moin != -1) { 
          if(lineChars[x+1] != "\"" && lineChars[x] != "z") {
            if(lineChars[x] == "G" && lineChars[x+1] == ",") lineChars[x] = "G";
            else if(lineChars[x] == "A" && lineChars[x+1] == ",") lineChars[x] = "G1";
            else if(lineChars[x] == "B" && lineChars[x+1] == ",") lineChars[x] = "G2";
            else if(lineChars[x] == "C") lineChars[x] = "G3";
            else if(lineChars[x] == "D") lineChars[x] = "D";
            else if(lineChars[x] == "E") lineChars[x] = "D1";
            else if(lineChars[x] == "F") lineChars[x] = "D2";
            else if(lineChars[x] == "G") lineChars[x] = "D3";
            else if(lineChars[x] == "A") lineChars[x] = "A";
            else if(lineChars[x] == "B") lineChars[x] = "A1";
            else if(lineChars[x] == "c") lineChars[x] = "A2";
            else if(lineChars[x] == "d") lineChars[x] = "A3";
            else if(lineChars[x] == "e") lineChars[x] = "E";
            else if(lineChars[x] == "f") lineChars[x] = "E1";
            else if(lineChars[x] == "g") lineChars[x] = "E2";
            else if(lineChars[x] == "a") lineChars[x] = "E3";
            else if(lineChars[x] == "b") lineChars[x] = "E4";
            papp = papp + lineChars[x] + " ";
          }
        }
      }
      if (papp.length) lines[i] = lines[i] + newLine + "w:" + papp;
    }
  }

  const insfeld = lines.join("\n");
  return insfeld;
}

function transposeUp({toProcess}) {
  const lines = prepareProcessable({toProcess});
  let i;
  for (i=0; i < lines.length; ++i) {
    lines[i] = unescape(lines[i]);
    const prefix = lines[i].substr(0,2);
    if (prefix == "K:") {
      let j = 2;
      while(j <= lines[i].length) {
        const character = lines[i].charAt(j)
        if (possibleKeys.includes(character)) {
          const charCode = character.charCodeAt(0);
          lines[i] = setCharAt(lines[i], j, String.fromCharCode((charCode > 70) ? 65 : charCode + 1));
          break;
        }
        j++;
      }
    } 
    else if (isMelody({line: lines[i]})) {// hier die Melodieabschnitte bearbeiten
      const derarray = lines[i].split("");
      let x;
      for(x=0; x<derarray.length; ++x) {/* zum Erstellen von a'' oder A,, -Klumpen */
        let allefertig = false;
        let mitzaehl = 0;
        if((derarray[x+1] == "'") || (derarray[x+1] == ",")) {
          do {
            mitzaehl = mitzaehl + 1;
            if(derarray[x+mitzaehl] == "'") {
              derarray[x] = derarray[x] + "'";
              derarray[x + mitzaehl] = ""; /* Arrays mit ' löschen */
            }
            else if(derarray[x+mitzaehl] == ",") {
              derarray[x] = derarray[x] + ",";
              derarray[x + mitzaehl] = ""; /* Arrays mit ' löschen */
            }
            else {
              allefertig = true; /* wenn alle ' in dem Abschnitt fertig sind - Ende. */
            }
          }
          while(allefertig == false);
        }
        else {// wenn es kein Klumpen ist, hier erstmal nix verändern
        }
      }
      let y;
      for(y=0; y<derarray.length; ++y) {/* Tonhöhe ändern */
        const miniarray = derarray[y].split("");
        if(miniarray[0] == "B" && miniarray[1] == ",") {/* Ausnahmefall 1 (, löschen) */
          miniarray[0] = "C";
          miniarray[1] = "";
        }
        else if(miniarray[0] == "b" && miniarray[1] == "'") { /* Ausnahmefall 2 (' hinzufügen) */
          miniarray[0] = "c";
          miniarray[1] = "''";
        }
        else if(miniarray[0] == "C") {
          miniarray[0] = "D";
        }
        else if(miniarray[0] == "D") {
          miniarray[0] = "E";
        }
        else if(miniarray[0] == "E") {
          miniarray[0] = "F";
        }
        else if(miniarray[0] == "F") {
          miniarray[0] = "G";
        }
        else if(miniarray[0] == "G") {
          miniarray[0] = "A";
        }
        else if(miniarray[0] == "A") {
          miniarray[0] = "B";
        }
        else if(miniarray[0] == "B") {
          miniarray[0] = "c";
        }
        else if(miniarray[0] == "c") {
          miniarray[0] = "d";
        }
        else if(miniarray[0] == "d") {
          miniarray[0] = "e";
        }
        else if(miniarray[0] == "e") {
          miniarray[0] = "f";
        }
        else if(miniarray[0] == "f") {
          miniarray[0] = "g";
        }
        else if(miniarray[0] == "g") {
          miniarray[0] = "a";
        }
        else if(miniarray[0] == "a") {
          miniarray[0] = "b";
        }
        else if(miniarray[0] == "b") {
          miniarray[0] = "c'";
        }
        derarray[y] = miniarray.join("");
      }

      let altogether = derarray.join("");
      const cutDownAtHand = altogether.split("\"");
      let m;
      for(m=0; m<cutDownAtHand.length; ++m) {/* Sonderzeichen NUR innerhalb von " und " wegmachen - also jeden 2. wenn array durchgegangen wird. */
        if(m%2 != 0) {// wenn Zahl gerade ist nichts machen - die ungeraden sollten innerhalb der anführungszeichen sein.
          cutDownAtHand[m] = cutDownAtHand[m].replace(/'/g, "");
          cutDownAtHand[m] = cutDownAtHand[m].replace(/,/g, "");
          doof = cutDownAtHand[m].split(""); // Damit Gitarrengriffe immer groß anfangen
          doof[0] = doof[0].toUpperCase();
          cutDownAtHand[m] = doof.join("");
        }
      }
      altogether = cutDownAtHand.join("\"");
      lines[i] = altogether;
    }
  }

  const insfeld = lines.join("\n");

  return insfeld;
}

function transposeDown({toProcess}) {

  const lines = prepareProcessable({toProcess});
  let i;
  for (i=0; i < lines.length; ++i) {
    lines[i] = unescape(lines[i]);
    const prefix = lines[i].substr(0,2);
    if (prefix == "K:") {
      let j = 2;
      while(j <= lines[i].length) {
        const character = lines[i].charAt(j)
        if (possibleKeys.includes(character)) {
          const charCode = character.charCodeAt(0);
          lines[i] = setCharAt(lines[i], j, String.fromCharCode((charCode == 65) ? 71 : charCode - 1));
          break;
        }
        j++;
      }
    }
    else if (isMelody({line: lines[i]})) {/* hier die Melodieabschnitte bearbeiten */
      const derarray = lines[i].split("");
      let x;
      for(x=0; x<derarray.length; ++x) {/* zum Erstellen von a'' oder A,, -Klumpen */
        let allefertig = false;
        let mitzaehl = 0;
        if((derarray[x+1] == "'") || (derarray[x+1] == ",")) {
          do {
            mitzaehl = mitzaehl + 1;
            if(derarray[x+mitzaehl] == "'") {
              derarray[x] = derarray[x] + "'";
              derarray[x + mitzaehl] = ""; /* Arrays mit ' löschen */
            }
            else if(derarray[x+mitzaehl] == ",") {
              derarray[x] = derarray[x] + ",";
              derarray[x + mitzaehl] = ""; /* Arrays mit ' löschen */
            }
            else {
              allefertig = true; /* wenn alle ' in dem Abschnitt fertig sind - Ende. */
            }
          }
          while(allefertig == false);
        }
        else {}//wenn es kein Klumpen ist, hier erstmal nix verändern */
      }
      let y;
      for(y=0; y<derarray.length; ++y) {/* Tonhöhe ändern */
        const miniarray = derarray[y].split("");
        if(miniarray[0] == "C" && miniarray[1] == ",") {/* Ausnahmefall 1 (, hinzufügen) */
          miniarray[0] = "B";
          miniarray[1] = ",,";
        }
        else if(miniarray[0] == "c" && miniarray[1] == "'") {/* Ausnahmefall 2 (' hinzufügen) */
          miniarray[0] = "b";
          miniarray[1] = "";
        }
        else if(miniarray[0] == "C") {
          miniarray[0] = "B,";
        }
        else if(miniarray[0] == "D") {
          miniarray[0] = "C";
        }
        else if(miniarray[0] == "E") {
          miniarray[0] = "D";
        }
        else if(miniarray[0] == "F")
        {
          miniarray[0] = "E";
        }
        else if(miniarray[0] == "G") {
          miniarray[0] = "F";
        }
        else if(miniarray[0] == "A") {
          miniarray[0] = "G";
        }
        else if(miniarray[0] == "B") {
          miniarray[0] = "A";
        }
        else if(miniarray[0] == "c") {
          miniarray[0] = "B";
        }
        else if(miniarray[0] == "d") {
          miniarray[0] = "c";
        }
        else if(miniarray[0] == "e") {
          miniarray[0] = "d";
        }
        else if(miniarray[0] == "f") {
          miniarray[0] = "e";
        }
        else if(miniarray[0] == "g") {
          miniarray[0] = "f";
        }
        else if(miniarray[0] == "a") {
          miniarray[0] = "g";
        }
        else if(miniarray[0] == "b") {
          miniarray[0] = "a";
        }
        derarray[y] = miniarray.join("");
      }
      let altogether = derarray.join("");
      const cutDownAtHand = altogether.split("\"");
      let m;
      for(m=0; m<cutDownAtHand.length; ++m) {/* Sonderzeichen NUR innerhalb von " und " wegmachen - also jeden 2. wenn array durchgegangen wird. */
        if(m%2 != 0) { // wenn Zahl gerade ist nichts machen - die ungeraden sollten innerhalb der anführungszeichen sein.
          cutDownAtHand[m] = cutDownAtHand[m].replace(/'/g, "");
          cutDownAtHand[m] = cutDownAtHand[m].replace(/,/g, "");
          const doof = cutDownAtHand[m].split(""); // Damit Gitarrengriffe immer groß anfangen
          doof[0] = doof[0].toUpperCase();
          cutDownAtHand[m] = doof.join("");
        }
      }
      lines[i] = cutDownAtHand.join("\"");
    }
  }

  const insfeld = lines.join("\n");
  return insfeld;
}

function replaceCharWith({toProcess, fromToObj}) {
  const lines = prepareProcessable({toProcess});
  let i;
  for (i=0; i < lines.length; ++i) {
    lines[i] = unescape(lines[i]);
    if(isMelody({line: lines[i]})) {
      const cutDownAtHand = lines[i].split("\""); // bezeichnung unpassend, weil von woanders geklaut
      let m;
      for(m=0; m<cutDownAtHand.length; ++m) {/* sonderzeichen nur innerhalb von " und " wegmachen - also jeden 2. wenn array durchgegangen wird. */
        if(m%2 != 0) {// wenn zahl gerade ist nichts machen - die ungeraden sollten innerhalb der anführungszeichen sein.
          if(fromToObj) {
            let from;
            for (from in fromToObj) {
              if (cutDownAtHand[m] == from) {
                const re = new RegExp(from, "g");
                cutDownAtHand[m] = cutDownAtHand[m].replace(re, fromToObj[from]);
              }
            }
          }
        }
      }
      lines[i] = cutDownAtHand.join("\"");
    }
  }
  const insfeld = lines.join("\n");
  return insfeld;
}

function bToH({toProcess}) {
  return replaceCharWith({toProcess, fromToObj: {"B":"H"}});
}

function hToB({toProcess}) {
  return replaceCharWith({toProcess, fromToObj: {"H":"B"}});
}

function toDoReMi({toProcess}) {
  return replaceCharWith({toProcess, fromToObj: doReMiMapping});
}

function fromDoReMi({toProcess}) {
  const fromToObj = doReMiMapping;
  delete fromToObj["H"];
  return replaceCharWith({toProcess, fromToObj: objectFlip(fromToObj)});
}
