const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron', {  
      openDialog: () => {
        ipcRenderer.send('ondialogopen')
      }
    }
  )

  ipcRenderer.on('parsed-data', function (event, data) {
    document.getElementById('output').innerText = JSON.stringify(data)
  });