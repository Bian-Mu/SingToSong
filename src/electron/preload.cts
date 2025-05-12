import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld("electron", {
    //隐式返回
    subscribeStatistics: (callback: (statistics: any) => void) =>
        ipcOn("statistics", (stats) => {
            callback(stats)
        }),
    getStaticData: () => ipcInvoke("getStaticData")
} satisfies Window['electron'])

function ipcInvoke<Key extends keyof EventPayloadMapping>(key: Key): Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key)
}

function ipcOn<Key extends keyof EventPayloadMapping>(key: Key, callback: (payload: EventPayloadMapping[Key]) => void) {
    const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
    ipcRenderer.on(key, cb)
    return () => ipcRenderer.off(key, cb)
}

contextBridge.exposeInMainWorld('electronAPI', {
    fetchData: () => ipcRenderer.invoke('fetch-data'),
    processData: () => ipcRenderer.invoke('process-data')
});