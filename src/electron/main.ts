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

ipcMainHandle('readConfig', async () => {
    try {
        const response = await axios.get('http://localhost:5000/read-config');
        if (response.data.success) {
            return JSON.parse(JSON.stringify(response.data.config)) as Config
        }
        return defaultConfig
    } catch (error) {
        console.error('Error fetching data:', error);
        return defaultConfig
    }
});

ipcMainHandle('processMidi', async () => {
    try {
        const response = await axios.post('http://localhost:5000/process-midi');
        if (response.data.success) {
            return true
        }
        return false
    } catch (error) {
        console.error('Error fetching data:', error);
        return false
    }
});

ipcMainHandle('writeNotes', async (new_note: PitchUnion) => {
    try {
        const response = await axios.post('http://localhost:5000/write-notes', new_note, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            return true
        }
        return false
    } catch (error) {
        console.error('Error fetching data:', error);
        return false
    }
});

ipcMainHandle('deleteNotes', async (delete_note: PitchUnion) => {
    try {
        const response = await axios.post('http://localhost:5000/delete-notes', delete_note, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            return true
        }
        return false
    } catch (error) {
        console.error('Error fetching data:', error);
        return false
    }
});

const defaultConfig: Config = {
    name: "default",
    tempo: 60,
    timeSignature: [
        4,
        4
    ],
    keySignature: "C"
}
