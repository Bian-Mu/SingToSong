import { app, BrowserWindow, ipcMain } from "electron";
import path from "path"; //适配windows的反斜杠
import { ipcMainHandle, isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { startPythonServer, stopPythonServer } from "./backend.js";
import axios from "axios";


// app.on("ready", () => {
//     const mainWindow = new BrowserWindow({
//         webPreferences: {
//             preload: getPreloadPath(),
//         }
//     });
//     if (isDev()) {
//         mainWindow.loadURL("http://localhost:5123");
//     } else {
//         mainWindow.loadFile(getUIPath())
//     }

//     // pollResources(mainWindow);

//     ipcMainHandle("getStaticData", () => {
//         return getStaticData()
//     })
// })


app.whenReady().then(() => {
    startPythonServer();

    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        }
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"))
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopPythonServer();
        app.quit();
    }
});

function createWindow() {
    throw new Error("Function not implemented.");
}

ipcMainHandle('readNotes', async () => {
    try {
        const response = await axios.get('http://localhost:5000/read-notes');
        if (response.data.success) {
            return JSON.parse(JSON.stringify(response.data.pitchunions)) as PitchUnion[]
        }
        return []
    } catch (error) {
        console.error('Error fetching data:', error);
        return []
    }
});

// ipcMain.handle('process-data', async () => {
//     try {
//         const response = await axios.post('http://localhost:5000/process-data');
//         return response.data;
//     } catch (error) {
//         console.error('Error processing data:', error);
//         return { success: false, error };
//     }
// });