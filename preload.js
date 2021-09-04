const { contextBridge, ipcRenderer } = require('electron')

const { formatHtml } = require('./formatters/html')

contextBridge.exposeInMainWorld(
  'electron', {  
    openDialog: () => {
      ipcRenderer.send('ondialogopen')
    },
    openExport: () => {
      ipcRenderer.send('onopenexport')
    }
  }
)

ipcRenderer.on('parsed-data', function (event, data) {
  document.getElementById('output').innerHTML = formatHtml(data)
  document.getElementById('export').removeAttribute('disabled')
})
