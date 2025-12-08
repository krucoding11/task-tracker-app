const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  screen,
} = require("electron");
const path = require("path");
const waitPort = require("wait-port");

const platform = process.platform;

let tray = null;
let win = null;

const winWidth = 500;
const winHeight = 500;

async function createWindow() {
  win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    type: "panel",
    frame: false,
    // transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    titleBarStyle: "customButtonsOnHover",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  await waitPort({ host: "localhost", port: 3001 });
  win.loadURL("http://localhost:3001");

  win.hide();
}

app.whenReady().then(async () => {
  await createWindow();

  // open devTools
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    win.webContents.toggleDevTools();
  });

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

  // cross-platform implementation
  tray.on("click", (event, bounds) => {
    if (win.isVisible()) {
      win.hide();
      return;
    }

    let x, y;
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;

    if (platform === "darwin") {
      x = Math.round(bounds.x + bounds.width / 2 - winWidth / 2);
      if (x < 10) x = 10;
      if (x + winWidth > width) x = width - winWidth - 10;
      y = Math.round(bounds.y + bounds.height + 5);
    } else if (platform === "win32") {
      x = width - winWidth - 20;
      y = height - winHeight - 40;
    } else {
      x = Math.round(width / 2 - winWidth / 2);
      y = Math.round(height / 2 - winHeight / 2);
    }

    win.setPosition(x, y);
    win.show();
  });

  // hide popup when clicking outside
  // win.on("blur", () => {
  //   if(win.isVisible()){
  //     win.hide();
  //   }
  // })

  const menu = Menu.buildFromTemplate([
    { label: "Open App", click: () => win.show() },
    { role: "quit" },
  ]);

  tray.setContextMenu(menu);
});
