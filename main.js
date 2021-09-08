const { app, ipcMain, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const template = require('./data/menu')
const parseScp = require('./parsers/scp')
const formatText = require('./formatters/text')

let win;
let currentSCP;

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

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

app.on('selectFile', () => importScp())
ipcMain.on('ondialogopen', (event) => importScp(event))

app.on('exportFile', () => exportText())
ipcMain.on('onopenexport', () => exportText())

const importScp = (event) => {
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
                    currentSCP = results.parsed
                    Menu.getApplicationMenu().getMenuItemById('export').enabled = true
                    if (event) {
                        event.reply('parsed-data', results.parsed)
                    } else {
                        win.webContents.send('parsed-data', results.parsed)
                    }
                } else {
                    dialog.showErrorBox('Error parsing SCP', 'Could not parse the given file. Check that this is a valid .scp file and try again.')
                }
            })
        }
    })
}

const exportText = () => {
    if (!currentSCP) {
        dialog.showErrorBox('Error exporting SCP', 'No SCP file loaded. Select a valid .scp file and try again.')
        return
    }
    dialog.showSaveDialog({
        defaultPath: `${currentSCP.fileName}.txt`,
    }).then(result => {
        if (!result.canceled) {
            fs.writeFile(result.filePath, formatText(currentSCP), (err) => {
                if (err) throw err;
                dialog.showMessageBox(null, { message: `Successfully exported to ${result.filePath}` })
            })
        }
    })
}
