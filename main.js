const { app, ipcMain, BrowserWindow, Menu, MenuItem, dialog } = require('electron')
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

const template = [
    {
        role: 'window',
        submenu: [
           {
              role: 'minimize'
           },
           {
              role: 'close'
           }
        ]
    },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

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
        if (!result.canceled) {
            const file = result.filePaths[0]
            const extension = path.extname(file)
            const fileName = path.basename(file, extension)

            fs.readFile(result.filePaths[0], (err, data) => {
                if (err) throw err
                let results = parseScp(fileName, data)
                if (results.success) {
                    event.reply('parsed-data', results.parsed)
                } else {
                    dialog.showErrorBox('Error parsing SCP', 'Could not parse the given file. Check that this is a valid .scp file and try again.')
                }
            })
        }
    })
})

ipcMain.on('onopenexport', (event, args) => {
    data = args[0]
    dialog.showSaveDialog({
        defaultPath: `${data.fileName}.txt`,
    }).then(result => {
        if (!result.canceled) {
            fs.writeFile(result.filePath, formatText(data), (err) => {
                if (err) throw err;
                dialog.showMessageBox(null, { message: `Successfully exported to ${result.filePath}` })
            })
        }
    })
})
