const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron', {  
      openDialog: () => {
        ipcRenderer.send('ondialogopen')
      }
    }
  )

  ipcRenderer.on('parsed-data', function (event, data) {
    document.getElementById('output').innerHTML = `
      <h2>${data.fileName}</h2>
      <h3>HEADER</h3>
      <p>Number of animations: ${data.header.numAnimations}<br />
      Unknown value: ${data.header.unknownValue}<br />
      Number of actions: ${data.header.numActions}</p>

      <h3>ACTIONS</h3>
      ${formatActions(data.actions)}

      <h3>SCRIPTS</h3>
      <p>Number of script dwords: ${data.scripts.dwordCount}</p>
      <p>TODO</p>
    `
  });

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
