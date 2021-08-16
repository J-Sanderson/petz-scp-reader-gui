document.getElementById('select').addEventListener('click', function() {
    window.electron.openDialog()
})

document.getElementById('export').addEventListener('click', function() {
    window.electron.openExport()
})