const shell = require("shelljs")
const { getAllInstalledSoftwareSync } = require("fetch-installed-software")
const compareVersions = require("compare-versions")
const path = require("path")

const requiredPrograms = [
  {
    DisplayName: "7-Zip",
    DisplayVersion: "19.00",
    cOp: ">=",
    command: "7z1900.exe /S",
    appPath: "C:\\Program Files (x86)\\7-Zip"
  },
  {
    DisplayName: "Firebird",
    DisplayVersion: "2.5.3.x",
    cOp: "=",
    command:
      'Firebird-2.5.3.26778_0_Win32.exe /MERGETASKS="CopyFbClientAsGds32Task,EnableLegacyClientAuth" /VERYSILENT',
    appPath: "C:\\Program Files (x86)\\Firebird\\Firebird_2_5"
  }
]

const mustInstall = getNeededToInstall(requiredPrograms)

function getNeededToInstall(requiredPrograms) {
  const installedPrograms = getAllInstalledSoftwareSync()

  const needToInstall = requiredPrograms.filter(rp => {
    for (const app of installedPrograms) {
      if (
        app.DisplayName &&
        app.DisplayName.match(rp.DisplayName) &&
        compareVersions.compare(rp.DisplayVersion, app.DisplayVersion, rp.cOp)
      ) {
        return false
      }
    }
    // if cannot find a required software, it must install it
    return true
  })

  return needToInstall
}

console.log(mustInstall)

for (const install of mustInstall) {
  shell.cd(path.resolve(".\\repo\\Install"))
  shell.exec(install.command)
  shell.echo(shell.env.PATH)

  shell.cd(path.resolve("../../"))
  shell.exec(`node setEnvPath.js "${shell.env.PATH}" "${install.appPath}"`, {
    async: false
  })
  // shell.exec(`powershell -NoExit -Command "setx /M PATH '${shell.env.PATH};${install.appPath}';exit;"`
  // )
  shell.exec(`powershell -Command "exit;"`)
  shell.echo(shell.env.PATH)
}

// shell.exec("node index.js")
console.log("start kit installation")
