const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const { parseScp } = require('./parsers/scp')
const { formatText } = require('./formatters/text')

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
        const file = result.filePaths[0]
        const extension = path.extname(file)
        const fileName = path.basename(file, extension)

        fs.readFile(result.filePaths[0], (err, data) => {
            if (err) throw err
            let results = parseScp(fileName, data)
            event.reply('parsed-data', results)
        })
    })
})

ipcMain.on('onopenexport', (event, args) => {
    data = args[0]
    dialog.showSaveDialog({
        defaultPath: `${data.fileName}.txt`,
    }).then(result => {
        fs.writeFile(result.filePath, formatText(data), (err) => {
            if (err) throw err;
            console.log('done')
        })
    })
})
