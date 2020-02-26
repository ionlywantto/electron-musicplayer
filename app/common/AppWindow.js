
const { BrowserWindow } = require('electron').remote
const path = require('path')
/**
 * 窗口基类
 */
class AppWindow extends BrowserWindow {
    constructor(config, fileLocation) {
        const baseConfig = {
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

module.exports = AppWindow