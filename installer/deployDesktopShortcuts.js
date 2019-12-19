const ws = require("windows-shortcuts")
const path = require("path")
const apps = [
  { parentFolder: "Sistemas/Retaguarda", name: "Retaguarda", execPath: "Retaguarda.exe" },
  { parentFolder: "Sistemas/Pre-venda", name: "Pre-venda", execPath: "PreVenda.exe" },
  { parentFolder: "Sistemas/Frente", name: "Frente", execPath: "Caixa.exe" },
  { parentFolder: "Sistemas/SAT Gerenciador", name: "SAT Gerenciador", execPath: "SATGerenciador.exe" },
  { parentFolder: "Acesso", name: "AnyDesk", execPath: "AnyDesk.exe" },
  { parentFolder: "Acesso", name: "TeamViewer", execPath: "TeamViewerQS.exe" }
]
const rootDir = path.join(process.cwd(), "C:/MBD")
const main = () => {
  for (app of apps) {
    let shortcut = path.join((process.execPath), `%UserProfile%/Desktop/${app.name}.lnk`)
    console.log("TCL: main -> shortcut", shortcut)
    ws.create(
      shortcut,
      {
        target: `${rootDir}/${app.parentFolder}/${app.execPath}`,
        workingDir: `${rootDir}/${app.parentFolder}`,
        icon: `${rootDir}/${app.parentFolder}/${app.execPath}`,
        runStyle: ws.MAX,
      }, (err) => {
        if (err)
          throw Error(err);
        else
          console.log(`Shortcut of ${app.name} created!`);
      }
    )
  }
}

main()