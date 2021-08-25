const Parser = require('binary-parser').Parser

const { scpVerbs, fudgers, cueCodes, callsFudger } = require('../data/data')

module.exports = {
    parseScp: (fileName, file) => {
        try {
            const headerParser = new Parser()
                .endianess('little')
                .string('copyright', {
                    zeroTerminated: true,
                })
                .uint32('animations')
                .uint32('unknown')
                .skip(8)
                .uint32('actions')
            const header = headerParser.parse(file)

            const individualActionParser = new Parser()
                .endianess('little')
                .uint32('actionID')
                .uint32('numScripts')
                .uint32('animation1')
                .uint32('animation2')
                .skip(4)
                .uint16('unknown')
                .uint16('sameAnimationModifier')
                .skip(4)
                .uint32('script')
            const actionParser = new Parser()
                .endianess('little')
                .skip(82) //skip header
                .array('actions', {
                    type: individualActionParser,
                    length: header.actions
                })
            const actions = actionParser.parse(file)

            const scriptDwordParser = new Parser()
                .endianess('little')
                .skip(82 + (header.actions * 32)) //skip header and actions
                .uint32('dwordCount')
            const scriptDwords = scriptDwordParser.parse(file)

            const dwordParser = new Parser()
                .endianess('little')
                .array('bytes', {
                    type: "uint8",
                    length: 4,
                });
            const scriptParser = new Parser()
                .endianess('little')
                .skip(82 + (header.actions * 32) + 4) //skip header, actions, dword count
                .array('dwords', {
                    type: dwordParser,
                    length: scriptDwords.dwordCount,
                })
                .string('copyright', {
                    zeroTerminated: true,
                });
            const script = scriptParser.parse(file)

            const parsed = parseResults(fileName, header, actions, scriptDwords, script)

            return {
                success: true,
                parsed,
            }
        }
        catch(err) {
            return { success: false }
        }
    }
}

parseResults = (fileName, header, actions, scriptDwords, script) => {
    return {
        fileName: `${fileName}`,
        header: {
            numAnimations: header.animations,
            unknownValue: header.unknown,
            numActions: header.actions,
        },
        actions: parseActions(actions),
        scripts: {
            dwordCount: scriptDwords.dwordCount,
            scripts: parseScripts(script)
        }
    }
}

parseActions = (actions) => {
    return actions.actions.map(action => {
        return {
            id: action.actionID,
            numScripts: action.numScripts,
            startAnimation: action.animation1,
            endAnimation: action.animation2,
            unknownValue: action.unknown,
            sameAnimationModifier: action.sameAnimationModifier,
            scriptStart: action.script,
        }
    })
}

parseScripts = (script) => {
    const scriptEnd = 99
    let chunkedScripts = []

    let sliceStart = 0;
    script.dwords.forEach(function (dword, index) {
        if (dword.bytes[0] === scriptEnd) {
            chunkedScripts.push(script.dwords.slice(sliceStart, index + 1));
            sliceStart = index + 1;
        }
    })

    let dwordTotal = 0;

    return chunkedScripts.map(script => {
        let obj = {
            startPosition: dwordTotal,
            dwordCount: script[0].bytes[0],
            commands: parseIndividualScript(script.slice(1)),
        }
        dwordTotal += script[0].bytes[0];
        return obj
    })
}

parseIndividualScript = (script) => {
    const commandEnd = 64
    let chunkedCommands = []

    script.forEach(function (dword, index) {
        if (dword.bytes[3] === commandEnd) {
            command = [dword]
            let commandDone = false
            let pos = index + 1
            while (!commandDone) {
                if (script[pos] && script[pos].bytes[3] !== commandEnd) {
                    command.push(script[pos])
                    pos++;
                } else {
                    commandDone = true
                }
            }
            chunkedCommands.push(command)
        }
    });

    return chunkedCommands.map(command => {
        let list = [];
        for (var i = 0; i < command.length; i++) {
            if (i === 0) {
                // get the verb
                list.push(`${toHexString(command[i].bytes[0])}: ${scpVerbs[toHexString(command[i].bytes[0])]}`);
            } else {
                // get the params
                if (callsFudger.includes(scpVerbs[toHexString(command[0].bytes[0])]) && i === 1) {
                    // if fudger and first param, show fudger name
                    list.push(` ${fudgers[toHexString(command[i].bytes[0])]}`);
                } else if (scpVerbs[toHexString(command[0].bytes[0])] === 'cueCode1' && i === 1) {
                    // if cue code, show cue code name
                    list.push(` ${cueCodes[toHexString(command[i].bytes[0])]}`);
                } else {
                    // else show param as hex number
                    list.push(
                        ' ' +
                        command[i].bytes.map(function(byte) {
                            return toHexString(byte);
                        })
                        .reverse()
                        .join('')
                    );
                }
            }
        }
        return list
    })
}

function toHexString(value) {
    return leftPad(value.toString(16).toUpperCase());
}

function leftPad(string) {
    if (string.length === 1) {
        string = `0${string}`;
    }
    return string
}