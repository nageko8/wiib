const { app, BrowserWindow } = require("electron");
const path = require("path");

function crearVentana() {
  const ventana = new BrowserWindow({
    width: 420,
    height: 640,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  ventana.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  crearVentana();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
