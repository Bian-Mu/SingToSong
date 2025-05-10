import path from "path"
import { app } from 'electron'
import { isDev } from "./util.js"

//生产模式下，app.getAppPath()返回的是resources/app.asar(dir)/的路径，dist-electron与app.asar同级
//preload.cjs 通常放在 ASAR 外部
export function getPreloadPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        '/dist-electron/preload.cjs'
    )
}