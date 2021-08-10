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
                .uint32('actions')
            const header = headerParser.parse(data)
            console.log(header)

            const individualActionParser = new Parser()
                .endianess('little')
                .uint32('actionID')
                .uint32('numScripts')
                .uint32('animation1')
                .uint32('animation2')
                .skip(4)
                .uint16('unknown')
                .uint16('sameAnimationModifier')
                .skip(4)
                .uint32('script')
            const actionParser = new Parser()
                .endianess('little')
                .skip(82) //skip header
                .array('actions', {
                    type: individualActionParser,
                    length: header.actions
                })
            const actions = actionParser.parse(data)
            console.log(actions)

            const scriptDwordParser = new Parser()
                .endianess('little')
                .skip(82 + (header.actions * 32)) //skip header and actions
                .uint32('dwordCount')
            const scriptDwords = scriptDwordParser.parse(data)
            console.log(scriptDwords)

            const dwordParser = new Parser()
                .endianess('little')
                .array('bytes', {
                    type: "uint8",
                    length: 4,
                });
            const scriptParser = new Parser()
                .endianess('little')
                .skip(82 + (header.actions * 32) + 4) //skip header, actions, dword count
                .array('dwords', {
                    type: dwordParser,
                    length: scriptDwords.dwordCount,
                })
                .string('copyright', {
                    zeroTerminated: true,
                });
            const script = scriptParser.parse(data);
            console.log(script)
        })
    })
})