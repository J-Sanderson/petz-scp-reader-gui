const { contextBridge, ipcRenderer } = require('electron')

const { formatHtml } = require('./formatters/html')

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
  currentSCP = data
  document.getElementById('output').innerHTML = formatHtml(data)
  document.getElementById('export').removeAttribute('disabled')
});
