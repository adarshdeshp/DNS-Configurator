const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: `${__dirname}/preload.js`, 
    },
  });

  mainWindow.loadFile("index.html");
});

ipcMain.handle("execute-command", async (event, command) => {
  const { exec } = require("child_process");
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle("write-log", async (event, logMessage) => {
  const logFilePath = path.join(app.getPath("userData"), "activity.log");
  console.log("Attempting to write to log file:", logFilePath);

  const logEntry = `${new Date().toISOString()}: ${logMessage}\n`;

  return new Promise((resolve, reject) => {
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error("Failed to write log:", err);
        reject(err);
      } else {
        console.log("Log written successfully");
        resolve();
      }
    });
  });
});
