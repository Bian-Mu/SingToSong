import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback: (statistics: any) => void) => callback({}),
    getStaticData: () => console.log('static'),
})

contextBridge.exposeInMainWorld('electronAPI', {
    fetchData: () => ipcRenderer.invoke('fetch-data'),
    processData: () => ipcRenderer.invoke('process-data')
});