const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  executeCommand: (command) => ipcRenderer.invoke("execute-command", command),
  platform: process.platform, 
  writeLog : (message)=>ipcRenderer.invoke('write-log',message),
});
