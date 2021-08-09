const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron', {  
      openDialog: () => {
        ipcRenderer.send('ondialogopen')
      }
    }
  )