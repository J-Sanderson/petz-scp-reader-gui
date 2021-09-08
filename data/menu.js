const { app } = require('electron')

module.exports = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Select',
                click: () => app.emit('selectFile'),
            },
            {
                label: 'Export',
                enabled: false,
                id: 'export',
                click: () => app.emit('exportFile'),
            }
        ],
    },
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