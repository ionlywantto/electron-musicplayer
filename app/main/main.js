const electron = require('electron')
const { app, BrowserWindow, dialog, Tray, ipcMain } = require('electron')
const path = require('path')
//const AppWindow = require('../common/AppWindow')
const DataStore = require('../utils/DataStore')
const myStore = new DataStore({'name': 'MusicData'})
let mainWindow
console.log(app.getPath('userData'))

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
// 或者 app.whenReady().then(createWindow)
app.on('ready', () => {
    createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if(process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        // 在macOS上，当单击dock图标并且没有其他窗口打开时，
        // 通常在应用程序中重新创建一个窗口。
        createWindow()
    }
})

function createWindow() {
    // 创建浏览器窗口，加载index.html
    mainWindow = new BrowserWindow({
        show: false,
        width: 900,
        height: 650,
        icon: path.join(__dirname, '../resources/img', 'icon.png'),
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile(path.join(__dirname, '../renderer', 'index.html'))
        mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    //let addMusicWindow
    handleMenuAndTray()
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.send('getTracks', myStore.getTracks())
    })
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
    // ipcMain.on('add-music', (event, arg) => {
    //     console.log('add music')
    //     addMusicWindow = new AppWindow({
    //         width: 500,
    //         height: 400,
    //         parent: mainWindow
    //     }, path.join(__dirname, '../renderer', 'add.html'))
        
    //     // Open the DevTools.
    //     //addMusicWindow.webContents.openDevTools()
    //  })
    //  ipcMain.on('open-music-file', (event) => {
    //      dialog.showOpenDialog({
    //          title: "选择音乐文件",
    //          properties: ['openFile', 'multiSelections'],
    //          filters: [
    //             { name: '音乐', extensions: ['mp3', 'wma', 'vqf'] },
    //             { name: '所有文件', extensions: ['*'] }
    //           ]
    //      }).then(result => {
    //         if(result.filePaths) {
    //             event.sender.send('selected-file', result.filePaths)
    //         }
    //      }).catch(err => {
    //        console.log(err)
    //      })
    //     console.log('open from renderer')
    //  })

     ipcMain.on('add-tracks', (event, tracks) => {
        const updatedTracks = myStore.addTracks(tracks).getTracks();
        mainWindow.send('getTracks', updatedTracks)
        // if(addMusicWindow) {addMusicWindow.close()}
        mainWindow.focus()
     })

    //  ipcMain.on('delete-track', (event, id) => {
    //     const updatedTracks = myStore.delteTrack(id).getTracks()
    //     mainWindow.send('getTracks', updatedTracks)
    //  })
     
    // 窗口关闭
    mainWindow.on('close', (e) => {
        e.preventDefault();
        dialog.showMessageBox({
            type: 'warning',
            title: '关闭',
            message: "是否确认播放器？",
            buttons: ['取消', '确定'],
            defaultId: 1,
            icon: path.join(__dirname, '../resources/img', 'question.png'),
            //noLink: true
        }).then((result) => {
            if (result.response === 1) {
                mainWindow = null
                app.exit()
            }
        })
    })
}

function handleMenuAndTray() {
    /*获取electron窗体的菜单栏*/
    const Menu = electron.Menu
    /*隐藏electron创听的菜单栏*/
    Menu.setApplicationMenu(null)
    const appIcon = new Tray(path.join(__dirname, '../resources/img', 'icon.png'))
    const contextMenu = Menu.buildFromTemplate([
    { label: '播放', type: 'normal' },
    { label: '退出播放器', type: 'normal' }
    ])

    // Make a change to the context menu
    contextMenu.items[1].checked = false

    // Call this again for Linux because we modified the context menu
    appIcon.setContextMenu(contextMenu)
}

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。
