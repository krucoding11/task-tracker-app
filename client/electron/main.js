const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  screen,
  ipcMain,
} = require("electron");
const path = require("path");
const waitPort = require("wait-port");

const platform = process.platform;

let tray = null;
let win = null;
let keepAliveWin = null;
const winWidth = 500;
const winHeight = 400;

function resourcePath(file){
  return app.isPackaged
  ? path.join(process.resourcesPath, file)
  : path.join(__dirname, file);
}

function createKeepAliveWindow() {
  keepAliveWin = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    webPreferences: { backgroundThrottling: false },
  });
  keepAliveWin.loadURL("about:blank");
}

async function createWindow() {
  win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    type: platform === "darwin" ? "panel" : undefined,
    focusable: platform !== "darwin",
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      // pageVisibility: true,
    },
  });

  // macOS floating
  if (platform === "darwin") {
    win.setAlwaysOnTop(true, "status");
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setFullScreenable(false);
  } else {
    win.setAlwaysOnTop(true, "screen-saver");
  }
  // if(process.platform === "darwin") win.setAlwaysOnTop(true, "floating");
  // else win.setAlwaysOnTop(true, "screen-saver");

  // win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // win.setAlwaysOnTop(true, platform === "darwin" ? "floating" : "screen-saver");

  win.on("close", (e) => {
    e.preventDefault();
    win.hide();
  });

  if (!app.isPackaged) {
    await waitPort({ host: "localhost", port: 3001 });
    win.loadURL("http://localhost:3001");
  } else {
    win.loadFile(path.join(process.resourcesPath, "dist/index.html"));
  }

  win.hide();
}

app.whenReady().then(async () => {
  createKeepAliveWindow();
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
    if (win.isVisible()) return win.hide();

    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });
    const {
      x: dispX,
      y: dispY,
      width: dispWidth,
      height: dispHeight,
    } = display.workArea;

    let x = Math.round(bounds.x + bounds.width / 2 - winWidth / 2);
    let y = 0;

    if (platform === "darwin") {
      // Pop below the menu bar icon
      y = bounds.y + bounds.height + 5;

      // Make sure window is fully on screen horizontally
      if (x < dispX) x = dispX + 5;
      if (x + winWidth > dispX + dispWidth)
        x = dispX + dispWidth - winWidth - 5;

      // Pop above the tray if menu bar is at bottom (rare)
      if (y + winHeight > dispY + dispHeight) {
        y = bounds.y - winHeight - 5;
      }
    } else if (platform === "win32") {
      // Pop above taskbar (default bottom taskbar)
      y = dispY + dispHeight - winHeight - 10;
      x = dispX + dispWidth - winWidth - 10;
    } else {
      // Linux: center
      x = dispX + Math.round((dispWidth - winWidth) / 2);
      y = dispY + Math.round((dispHeight - winHeight) / 2);
    }

    win.setBounds({ x, y, width: winWidth, height: winHeight });
    win.show();
  });

  const menu = Menu.buildFromTemplate([
    { label: "Open App", click: () => win.show() },
    { role: "quit" },
  ]);

  tray.on("right-click", () => {
    tray.setContextMenu(menu);
  });

  function overlayDot(basePath, dotPath) {
    const base = nativeImage.createFromPath(basePath).resize({
      width: 18,
      height: 18,
    });

    const dot = nativeImage.createFromPath(dotPath).resize({
      width: 6,
      height: 6,
    });

    // convert base into bitmap buffer
    const baseBmp = base.toBitmap();
    const dotBmp = dot.toBitmap();

    // manually paint dot near bottom center
    const width = base.getSize().width;
    const height = base.getSize().height;

    // pixel position - below icon
    const offsetX = Math.floor(width / 2) - 3; // horizontally centered
    const offsetY = height - 6; // near bottom icon

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const baseIdx = ((offsetY + y) * width + (offsetX + x)) * 4; // y - which row we are drawing on, width - how many pixels per row, x - which column we are drawing to, 4 - pixels has 4 values (dotIdx = y * 6 + x) * 4 - y*6: jumps the current row, +x: moves to correct column, *4: each dot pixel is RGBA
        const dotIdx = (y * 6 + x) * 4;

        baseBmp[baseIdx] = dotBmp[dotIdx]; // baseIdx = tells where to pase, dotIdx = tells where to read from
        baseBmp[baseIdx + 1] = dotBmp[dotIdx + 1];
        baseBmp[baseIdx + 2] = dotBmp[dotIdx + 2];
        baseBmp[baseIdx + 3] = dotBmp[dotIdx + 3];
      }
    }
    return nativeImage.createFromBitmap(baseBmp, { width, height });
  }

  ipcMain.on("tray:set-status", (event, status) => {
    const base = resourcePath("tray.png");

    if (status === "green") {
      tray.setImage(overlayDot(base, resourcePath("dot-green.png")));
    } else if (status === "red") {
      tray.setImage(overlayDot(base, resourcePath("dot-red.png")));
    } else {
      tray.setImage(nativeImage.createFromPath(base).resize({ width: 22, height: 22 }));
    }
    // let iconFile = "tray.png";

    // if(status === "green") iconFile = "tray-green.png";
    // if(status === "red") iconFile = "tray-red.png";

    // const img = nativeImage
    // .createFromPath(path.join(__dirname, iconFile))
    // .resize({ width: 18, height: 18});

    // img.setTemplateImage(false);
    // tray.setImage(img);
  });

  setInterval(() => {
    if (
      win &&
      !win.isDestroyed() &&
      win.webContents &&
      !win.webContents.isDestroyed()
    ) {
      win.webContents.executeJavaScript("void 0").catch(() => {});
    }
  }, 10000);

  // hide popup when clicking outside
  // win.on("blur", () => {
  //   if(win.isVisible()){
  //     win.hide();
  //   }
  // })
});
