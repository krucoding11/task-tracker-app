// window.electronAPI = {
//   ping: () => console.log("Preload loaded!")
// };

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI",{
  sendStatus: (status) => ipcRenderer.send("tray:set-status", status),
});           