const ws = require("./assets/windows-shortcuts/lib/windows-shortcuts")
const path = require("path")
const fs = require("fs")
const logger = require('./logger');
const shell = require('shelljs')

module.exports = async () => {

  const apps = [
    { parentFolder: "Sistemas/Retaguarda", name: "Retaguarda", execPath: "Retaguarda.exe" },
    { parentFolder: "Sistemas/Pre-venda", name: "Pre-venda", execPath: "PreVenda.exe" },
    { parentFolder: "Sistemas/Frente", name: "Frente", execPath: "Caixa.exe" },
    { parentFolder: "Sistemas/SAT Gerenciador", name: "SAT Gerenciador", execPath: "SATGerenciador.exe" },
    { parentFolder: "Acesso", name: "AnyDesk", execPath: "AnyDesk.exe" },
    { parentFolder: "Acesso", name: "TeamViewer", execPath: "TeamViewerQS.exe" }
  ]

  /**
  * * resolves path to root directory of Installer scripts inside project
  */
  const rootInstaller = path.resolve(__dirname)
  logger.info(`deployDesktopShortcuts: rootInstaller ${rootInstaller}`)


  const rootDir = path.resolve("C:\\MBD")
  logger.info(`deployDesktopShortcuts: rootDir ${rootDir}`)

  const shortcutBuffer = fs.readFileSync(path.join(rootInstaller, 'assets', 'Shortcut.exe'))
  shell.cd(path.dirname(process.execPath))
  fs.writeFileSync(path.join(process.cwd(), 'Shortcut.exe'), shortcutBuffer)

  const homedir = require('os').homedir();
  logger.info(`deployDesktopShortcuts: main -> homedir ${homedir}`)
  let fileBuffer = ''
  const shortcut = {}
  var done = 0
  // //denodeify transforms a node function into one that works with promises
  // const create = Q.denodeify(ws.create)

  const array = []
  for (const app of apps) {


    shortcut[app.name] = `${homedir}\\Desktop\\${app.name}.lnk`
    logger.info(`deployDesktopShortcuts: main -> shortcut ${shortcut[app.name]}`)
    const targetString = path.join(rootDir, app.parentFolder, app.execPath)
    logger.info(`deployDesktopShortcuts: main -> targetString ${targetString}`)

    ws.create(
      shortcut[app.name],
      {
        target: targetString,
        workingDir: path.join(rootDir, app.parentFolder),
        icon: `${path.join(rootDir, app.parentFolder, app.execPath)},0`,
        runStyle: ws.NORMAL,
      }, (err) => {
        done++;
        if (err) {
          logger.error(Error(err));
          throw Error(err)
        }
        else {
          logger.info(`Shortcut of ${shortcut[app.name]} created!`);
        }
        if (done == apps.length)
          shortcutCallback();
      }
    )
  }

  function shortcutCallback() {
    // remove original/source extracted file
    const removedShortcutEXE = shell.rm("-Rf", path.join(process.cwd(), 'Shortcut.exe'))
    if (removedShortcutEXE.code !== 0) {
      logger.warn("Delete Shortcut.exe manually.")
    }
    else {
      logger.info("Removed Shortcut.exe")
    }

  }

  return true
}