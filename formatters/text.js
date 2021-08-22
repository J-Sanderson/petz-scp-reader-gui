const { startsBlock, endsBlock } = require('../data/data')

module.exports = {
    formatText: (data) => {
        return `
${data.fileName}.scp output:

HEADER:
Number of animations: ${data.header.numAnimations}
Unknown value: ${data.header.unknownValue}
Number of actions: ${data.header.numActions}

-----

ACTIONS${formatActions(data.actions)}

-----

SCRIPTS:
Number of script dwords: ${data.scripts.dwordCount}
${formatScripts(data.scripts.scripts)}`
    }
}

formatActions = (actions) => {
    return actions.map(action => {
      return `
ID: ${action.id}
Number of associated scripts: ${action.numScripts}
Start animation: ${action.startAnimation}
End animation: ${action.endAnimation}
Unknown value: ${action.unknownValue}
Same animation modifier: ${action.sameAnimationModifier}
Script start point: ${action.scriptStart}
      `
    }).join('')
}

formatScripts = (scripts) => {
    return scripts.map(script => {
      return `
Script start position: ${script.startPosition}
Script dword count: ${script.dwordCount}
Commands:
${formatCommands(script.commands)}
      `
    }).join('')
}

formatCommands = (commands) => {
    let tabDepth = 0;
    return commands.map(command => {
      if (endsBlock.includes(command[0])) tabDepth--
      const str = `${tab(tabDepth)}${command[0]}: ${command.slice(1).join(', ')}`
      if (startsBlock.includes(command[0])) tabDepth++
      return str
    }).join('\n')
}

tab = (depth) => {
    return depth <= 0 ? '' : '\t'.repeat(depth)
}
