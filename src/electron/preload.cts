import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld("electron", {
    //隐式返回
    subscribeStatistics: (callback: (statistics: any) => void) =>
        ipcOn("statistics", (stats) => {
            callback(stats)
        }),
    getStaticData: () => ipcInvoke("getStaticData")
} satisfies Window['electron'])

contextBridge.exposeInMainWorld("electronAPI", {
    readNotes: () => ipcInvoke('readNotes'),
    readConfig: () => ipcInvoke('readConfig'),
    processMidi: () => ipcInvoke('processMidi'),
    writeNotes: (new_note: PitchUnion) => ipcInvoke("writeNotes", new_note)
})


function ipcInvoke<Key extends keyof EventPayloadMapping>(key: Key, ...args: any[]): Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key, ...args)
}

function ipcOn<Key extends keyof EventPayloadMapping>(key: Key, callback: (payload: EventPayloadMapping[Key]) => void) {
    const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
    ipcRenderer.on(key, cb)
    return () => ipcRenderer.off(key, cb)
}
