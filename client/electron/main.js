const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut } = require("electron");
const path = require("path");
const waitPort = require("wait-port");

let tray = null;
let win = null;


async function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  await waitPort({ host: "localhost", port: 3001 });
  win.loadURL("http://localhost:3001");
}

app.whenReady().then(async () => {
  await createWindow();

  // open devTools
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    win.webContents.toggleDevTools();
  })

  // Load icon safely with nativeImage
  const iconPath = path.join(
    app.isPackaged ? process.resourcesPath : __dirname,
    "tray.png"
  );
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 18, height: 18 });
  tray = new Tray(icon);

  tray.setToolTip("Task App");

  tray.on("click", () => win.show());

  const menu = Menu.buildFromTemplate([
    { label: "Open App", click: () => win.show() },
    { role: "quit" },
  ]);

  tray.setContextMenu(menu);
});
