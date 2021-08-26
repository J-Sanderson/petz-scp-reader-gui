const { startsBlock, endsBlock } = require('../data/data')

module.exports = {
  formatHtml: (data) => {
    return `
      <h2>${data.fileName}.scp</h2>
      <h3 id="header">HEADER</h3>
      <p>Skip to: Header | <a href="#actions">Actions</a> | <a href="#scripts">Scripts</a></p>
      <p>Number of animations: ${data.header.numAnimations}<br />
      Unknown value: ${data.header.unknownValue}<br />
      Number of actions: ${data.header.numActions}</p>

      <h3 id="actions">ACTIONS</h3>
      <p>Skip to: <a href="#header">Header</a> | Actions | <a href="#scripts">Scripts</a></p>
      ${formatActions(data.actions)}

      <h3 id="scripts">SCRIPTS</h3>
      <p>Skip to: <a href="#header">Header</a> | <a href="#actions">Actions</a> | Scripts</p>
      <p>Number of script dwords: ${data.scripts.dwordCount}</p>
      ${formatScripts(data.scripts.scripts)}
    `
  }
}

formatActions = (actions) => {
  return actions.map(action => {
    return `
      <p>ID: ${action.id}<br />
      Number of associated scripts: ${action.numScripts}</br />
      Start animation: ${action.startAnimation}<br />
      End animation: ${action.endAnimation}<br />
      Unknown value: ${action.unknownValue}<br />
      Same animation modifier: ${action.sameAnimationModifier}<br />
      Script start point: ${action.scriptStart}
      </p>
    `
  }).join('')
}

formatScripts = (scripts) => {
  return scripts.map(script => {
    return `
      <p>Script start position: ${script.startPosition}<br />
      Script dword count: ${script.dwordCount}<br />
      Commands:<br/>
      ${formatCommands(script.commands)}
      </p>
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
  }).join('<br />')
}

tab = (depth) => {
  return depth <= 0 ? '' : '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(depth)
}
