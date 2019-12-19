const ws = require("windows-shortcuts")
const path = require("path")
// const sleep = require("./helpers/sleep")
// const apps = [
//   { parentFolder: "Sistemas/Retaguarda", name: "Retaguarda", execPath: "Retaguarda.exe" },
//   { parentFolder: "Sistemas/Pre-venda", name: "Pre-venda", execPath: "PreVenda.exe" },
//   { parentFolder: "Sistemas/Frente", name: "Frente", execPath: "Caixa.exe" },
//   { parentFolder: "Sistemas/SAT Gerenciador", name: "SAT Gerenciador", execPath: "SATGerenciador.exe" },
//   { parentFolder: "Acesso", name: "AnyDesk", execPath: "AnyDesk.exe" },
//   { parentFolder: "Acesso", name: "TeamViewer", execPath: "TeamViewerQS.exe" }
// ]
const apps = [
  { parentFolder: "Retaguarda", name: "Retaguarda", execPath: "Retaguarda.exe" },
  { parentFolder: "Frente Touch", name: "Frente Touch", execPath: "FrenteTouch.exe" },
  { parentFolder: "Frente", name: "Frente", execPath: "Caixa.exe" },
  { parentFolder: "Sat Gerenciador", name: "SAT Gerenciador", execPath: "SATGerenciador.exe" },
]
const rootDir = path.resolve("C:/MBD")
console.log("TCL: rootDir", rootDir)
module.exports = () => {
  const homedir = require('os').homedir();
  console.log("TCL: main -> homedir", homedir)
  for (app of apps) {
    // let shortcut = path.join((process.execPath), `%UserProfile%/Desktop/${app.name}.lnk`)
    let shortcut = path.join(homedir, `Desktop/${app.name}.lnk`)
    console.log("TCL: main -> shortcut", shortcut)
    ws.create(
      shortcut,
      {
        target: `${rootDir}/${app.parentFolder}/${app.execPath}`,
        workingDir: `${rootDir}/${app.parentFolder}`,
        icon: `${rootDir}/${app.parentFolder}/${app.execPath}`,
        runStyle: ws.MAX,
      }, (err) => {
        if (err) {
          throw Error(err);
        }
        else {
          console.log(`Shortcut of ${shortcut} created!`);
        }
      }
    )
  }
}