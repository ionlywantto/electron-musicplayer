var { remote, ipcRenderer } = require('electron');
const path = require('path')
const { $, convertDuration } = require('../utils/helper') 

const AppWindow = require('../common/AppWindow')
const DataStore = require('./../utils/DataStore')
const myStore = new DataStore({'name': 'MusicData'})
let addMusicWindow
let allTracks
let currentTrack
let musicAudio = new Audio()

$('btn-add-music').addEventListener('click', () => {
    // addMusicWindow = new BrowserWindow({
    //     width: 500,
    //     height: 400,
    //     parent: mainWindow
    // }, path.join(__dirname, '../renderer', 'add.html'))

    addMusicWindow = new remote.BrowserWindow({
        show: false,
        width: 500,
        height: 400,
        parent: remote.mainWindow,
        icon: path.join(__dirname, '../resources/img', 'icon.png'),
        webPreferences: {
            nodeIntegration: true
            //devTools: true
        },
        parent: remote.BrowserWindow
    })
    addMusicWindow.loadFile(path.join(__dirname, '../renderer', 'add.html'))
    addMusicWindow.once('ready-to-show', () => {
        addMusicWindow.show()
    })
    // Open the DevTools.
    addMusicWindow.webContents.openDevTools()
    //ipcRenderer.send('add-music')
})

const renderListHtml = (tracks) => {
    const trackList = $('trackList')
    const trackListHtml = tracks.reduce((html, track) => {
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10">
                <i class="fa fa-1x fa-music mr-3 text-secondary"></i>
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fa fa-play mr-4" data-id="${track.id}"></i>
                <i class="fa fa-trash" data-id="${track.id}"></i>
            </div>
        </li>`
        return html
    }, '')
    const defaultHtml = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    trackList.innerHTML = tracks.length ? `<ul class="list-group">${trackListHtml}</ul>` : defaultHtml
}

ipcRenderer.on('getTracks', (event, tracks) => {
    allTracks = tracks;
    renderListHtml(allTracks)
})

// remote.on('add-tracks', (event, tracks) => {
//     allTracks = myStore.addTracks(tracks).getTracks();
//     //mainWindow.send('getTracks', updatedTracks)
//     //if(addMusicWindow) {addMusicWindow.close()}
//     renderListHtml(tracks)
//     mainWindow.focus()
//  })

const rendererPalyerHtml = (name, duration) => {
    const player = $('player-status')
    const html = `<div class="col-9 font-weight-blod">
                    正在播放：${name}
                  </div>
                  <div class="col-3">
                    <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                  </div>`
    player.innerHTML = html
}

const updatePalyerHtml = (currentTime, duration) => {
    //计算 progress
    const progress = Math.floor(currentTime / duration * 100)
    const bar = $('player-progress')
    bar.style.width = progress + '%'
    const seeker = $('current-seeker')
    seeker.innerHTML = convertDuration(currentTime)
}

musicAudio.addEventListener('loadedmetadata', () => {
    //渲染播放器状态
    rendererPalyerHtml(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
    //更新播放器状态
    updatePalyerHtml(musicAudio.currentTime, musicAudio.duration)
})

$('trackList').addEventListener('click', (event) => {
    event.preventDefault()
    const { dataset, classList } = event.target
    const groupItemClassList = event.target.parentElement.parentElement.classList
    const id = dataset && dataset.id
    if(id && classList.contains('fa-play')) {
        //播放逻辑
        if(currentTrack && currentTrack.id === id) {
            //点击的还是当前音乐
            musicAudio.play()
        } else {
            //点击其他歌曲播放
            currentTrack = allTracks.find(track => track.id === id)
            musicAudio.src = currentTrack.path
            musicAudio.play()
            //如果之前播放歌曲是暂停状态图标，恢复播放图标
            const resetIconEle = document.querySelector('.fa-pause')
            if(resetIconEle) {
                resetIconEle.classList.replace('fa-pause', 'fa-play')
                resetIconEle.parentElement.parentElement.classList.remove('list-group-item-primary')
            }
            //如果之前播放歌曲是播放状态图标，将原来的背景去掉
            const activeItem = document.querySelector('.list-group-item-primary')
            if(activeItem) {
                activeItem.classList.remove('list-group-item-primary')
            }
        }
        classList.replace('fa-play', 'fa-pause')
        groupItemClassList.add('list-group-item-primary');
    } else if(id && classList.contains('fa-pause')) {
        //暂停逻辑
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
    } else if(id && classList.contains('fa-trash')) {
        remote.dialog.showMessageBox({
            type: 'warning',
            title: '删除',
            message: "是否确认删除本歌曲？",
            checkboxLabel: "同时删除本地歌曲文件",
            checkboxChecked: false,
            icon: path.join(__dirname, '../resources/img', 'question.png'),
            buttons: ['取消', '确定'],
            defaultId: 1
            //noLink: true
        }).then((result) => {
            if (result.response === 1) {
                const fs =require('electron').remote.require('fs')
                //删除的是当前播放歌曲
                if(currentTrack && currentTrack.id === id) {
                    musicAudio.pause()
                }
                
                if(result.checkboxChecked) {
                    const trashTrack = allTracks.find(track => track.id === id)
                    if(trashTrack) {
                        fs.unlinkSync(trashTrack.path)
                    }
                }
                renderListHtml(myStore.delteTrack(id).getTracks())
                //删除逻辑
                //ipcRenderer.send('delete-track', id)
            }
        });
    }
})