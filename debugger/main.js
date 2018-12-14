import { app, Menu, BrowserWindow } from "electron"
import { join } from "path"

app.on("ready", () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    role: "toggledevtools"
  }, {
    role: "forcereload"
  }, {
    role: "togglefullscreen"
  }]))
  const window = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, "shims.js")
    },
    show: false
  })
  window.loadURL(join(__dirname, "..", "dist", "debugger.html"))
  window.on("ready-to-show", () => window.show())
})
