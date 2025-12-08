window.electronAPI = {
  ping: () => console.log("Preload loaded!")
};

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron",{
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data)
  }
})  