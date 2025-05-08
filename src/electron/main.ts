import { app, BrowserWindow, ipcMain } from "electron";
import path from "path"; //适配windows的反斜杠
import { isDev } from "./util.js";
import { pollResources } from "./resourceManager.js";
import { getPreloadPath } from "./pathResolver.js";
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
//         mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"))
//     }

//     pollResources();
// })


let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
    startPythonServer();

    mainWindow = new BrowserWindow({
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

ipcMain.handle('fetch-data', async () => {
    try {
        const response = await axios.get('http://localhost:5000/get-data');
        // 确保只返回可序列化的数据
        return {
            success: response.data.success,
            data: JSON.parse(JSON.stringify(response.data.data || {})),
            error: response.data.error || null
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
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