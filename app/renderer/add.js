var { remote, ipcRenderer } = require('electron');
const { $ } = require('../utils/helper')
const path = require('path')

const DataStore = require('../utils/DataStore')
const myStore = new DataStore({'name': 'MusicData'})

let musicFilePath = []

$('btn-select-music').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
        title: "选择音乐文件",
        properties: ['openFile', 'multiSelections'],
        filters: [
           { name: '音乐', extensions: ['mp3', 'wma', 'vqf'] },
           { name: '所有文件', extensions: ['*'] }
         ]
    }).then(result => {
        if(result.filePaths) {
            renderListHtml(result.filePaths)
            musicFilePath = result.filePaths
        }
    }).catch(err => {
      console.log(err)
    })
})

$('btn-import-music').addEventListener('click', () => {
    ipcRenderer.send('add-tracks', musicFilePath)
    remote.getCurrentWindow().close()
})

const renderListHtml = (pathes) => {
    const musicList = $('music-list')
    const musicItemsHtml = pathes.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html
    }, '')
    musicList.innerHTML = `<ul class="list-group">${musicItemsHtml}</ul>`
}