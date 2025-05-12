import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback: (statistics: any) => void) => {
        ipcRenderer.on("statistics", (_, stats) => {
            callback(stats)
        })
    },
    getStaticData: () => ipcRenderer.invoke("getStaticData")
} satisfies Window['electron'])

// contextBridge.exposeInMainWorld('electronAPI', {
//     fetchData: () => ipcRenderer.invoke('fetch-data'),
//     processData: () => ipcRenderer.invoke('process-data')
// });