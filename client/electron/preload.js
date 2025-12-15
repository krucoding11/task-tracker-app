const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendStatus: (status) => ipcRenderer.send("tray:set-status", status),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  hideWindow: () => ipcRenderer.invoke("hide-window"),
});
// console.log("preload Loaded");
