const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const Parser = require('binary-parser').Parser;

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('ondialogopen', (event) => {
    dialog.showOpenDialog({ 
        properties: ['openFile'],
        filters: [
            { name: 'SCPs', extensions: ['scp'] }
        ]
    }).then((result) => {
        fs.readFile(result.filePaths[0], (err, data) => {
            if (err) throw err
            const headerParser = new Parser()
                .endianess('little')
                .string('copyright', {
                    zeroTerminated: true,
                })
                .uint32('animations')
                .uint32('unknown')
                .skip(8)
                .uint32('actions');
            const header = headerParser.parse(data)
            console.log(header)
        })
    })
})