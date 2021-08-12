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
      <p>Number of animations: ${data.header.numAnimations}</p>
      <p>Unknown value: ${data.header.unknownValue}</p>
      <p>Number of actions: ${data.header.numActions}</p>

      <h3>ACTIONS</h3>
      <p>TODO</p>

      <h3>SCRIPTS</h3>
      <p>TODO</p>
    `
  });