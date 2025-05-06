import { app, BrowserWindow } from "electron";
import path from "path"; //适配windows的反斜杠


app.on("ready", () => {
    const mainWindow = new BrowserWindow({});
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"))
})