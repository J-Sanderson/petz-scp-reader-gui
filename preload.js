const { contextBridge, ipcRenderer } = require('electron')

const { formatActions, formatScripts } = require('./formatters/html')

let currentSCP;

contextBridge.exposeInMainWorld(
  'electron', {  
    openDialog: () => {
      ipcRenderer.send('ondialogopen')
    },
    openExport: () => {
      ipcRenderer.send('onopenexport', [currentSCP])
    }
  }
)

ipcRenderer.on('parsed-data', function (event, data) {
  currentSCP = data;
  document.getElementById('output').innerHTML = `
    <h2>${data.fileName}.scp</h2>
    <h3>HEADER</h3>
    <p>Number of animations: ${data.header.numAnimations}<br />
    Unknown value: ${data.header.unknownValue}<br />
    Number of actions: ${data.header.numActions}</p>

    <h3>ACTIONS</h3>
    ${formatActions(data.actions)}

    <h3>SCRIPTS</h3>
    <p>Number of script dwords: ${data.scripts.dwordCount}</p>
    ${formatScripts(data.scripts.scripts)}
  `
  document.getElementById('export').removeAttribute('disabled')
});
