// 一旦javascript上下文创建，这个文件就会被自动加载 它在一个
//私有环境内运行, 可以访问 electron 渲染器的 api的子集 。 我们必须小心, 
//不要泄漏任何对象到全局范围!
// const { ipcRenderer, remote } = require('electron')
// const fs = remote.require('fs')

// // read a configuration file using the `fs` module
// const buf = fs.readFileSync('allowed-popup-urls.json')
// const allowedUrls = JSON.parse(buf.toString('utf8'))

// const defaultWindowOpen = window.open

// function customWindowOpen (url, ...args) {
//   if (allowedUrls.indexOf(url) === -1) {
//     ipcRenderer.sendSync('blocked-popup-notification', location.origin, url)
//     return null
//   }
//   return defaultWindowOpen(url, ...args)
// }

// window.open = customWindowOpen


const electron = require('electron')
const path = require('path')
/**
 * 窗口基类
 */
class AppWindow extends BrowserWindow {
    constructor(config, fileLocation) {
        const baseConfig = {
            show: false,
            width: 900,
            height: 650,
            icon: path.join(__dirname, '../resources/img', 'icon.png'),
            webPreferences: {
                nodeIntegration: true
                //devTools: true
            }
        }

        // 合并参数配置
        // const finalConfig = Object.assign(baseConfig, config);
        const finalConfig = { ...baseConfig, ...config }
        super(finalConfig)
        this.loadFile(fileLocation)
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}
electron.BrowserWindow = AppWindow