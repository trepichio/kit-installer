const shell = require("shelljs")
const { getAllInstalledSoftwareSync } = require("fetch-installed-software")
const compareVersions = require("compare-versions")
const path = require("path")
const fs = require("fs")
const trycatchFn = require("./helpers/trycatchFn")
const logger = require('./logger')


module.exports = async () => {

  /**
   * * resolves path to root directory of Installer scripts inside project
   */
  const rootInstaller = path.resolve(__dirname)
  logger.info(`checkRequirements: rootInstaller ${rootInstaller}`)



  /**
   * * SOURCE list of required programs to install before  deploying Kit such as 7-zip (for compress and extraction) and Firebird (SGDB)
   */
  const requiredPrograms = [
    {
      DisplayName: "7-Zip",
      DisplayVersion: "19.00",
      comparatorVersion: ">=",
      command: "7z1900.exe /S",
      InstallLocation: "C:\\Program Files (x86)\\7-Zip"
    },
    {
      DisplayName: "Firebird",
      DisplayVersion: "2.5.3.x",
      comparatorVersion: "=",
      command:
        'Firebird-2.5.3.26778_0_Win32.exe /MERGETASKS="CopyFbClientAsGds32Task,EnableLegacyClientAuth" /VERYSILENT',
      InstallLocation: "C:\\Program Files (x86)\\Firebird\\Firebird_2_5\\bin"
    }
  ]

  /**
   * * a list of required softwares retrieved from user system that lacks installation
   */
  const mustInstall = await getNeededToInstall(requiredPrograms)
  logger.info(`checkRequirements: mustInstall ${JSON.stringify([...mustInstall])}`)

  if (mustInstall.length === 0) {
    logger.info("Nothing to install.");
  }
  else {

    /**
     * * show ENVIROMENT PATH of Node running process before modifying it
   */
    shell.echo("ORIGINAL PATH:" + shell.env.PATH)

    const assetsFolder = path.join(rootInstaller, 'assets')
    logger.info(`checkRequirements: assetsFolder ${assetsFolder}`)
    const regexFileEXE = /^.+.exe\b/g
    logger.info(`checkRequirements: regexFileEXE ${regexFileEXE}`)

    /**
     * * executes Shell commands for each required software for its installation on system and sets their env path
     */
    for (const install of mustInstall) {
      let [requiredFile] = install.command.match(regexFileEXE)
      logger.info(`checkRequirements: requiredFile ${requiredFile}`)

      let requiredFilePath = path.join(assetsFolder, requiredFile)
      logger.info(`checkRequirements: requiredFilePath ${requiredFilePath}`)


      const fileBuffer = fs.readFileSync(requiredFilePath)
      const requiredFileAtFS = path.join(process.cwd(), requiredFile)
      fs.writeFileSync(requiredFileAtFS, fileBuffer)

      //* navigate to current folder at runtime */
      shell.cd(process.cwd())

      logger.info(`Initiating ${install.DisplayName} installation...`);

      //* executes installer command */
      const execInstall = await trycatchFn(shell.exec, install.command)

      if (!execInstall || execInstall.code !== 0) {
        shell.echo(`Error: Failed to install ${install.DisplayName}`)
        execInstall && shell.echo(execInstall.stderr)
      } else {
        shell.echo(`No errors for installation of ${install.DisplayName}`)
        shell.echo(execInstall.stdout)

        /**
         * * navigates to root directory of Installer scripts inside project
         */
        shell.cd(process.cwd())

        //** set up NODE enviroment PATH for application to run on scripts */
        setPath(install.InstallLocation)
        shell.exec(`powershell -Command "exit;"`)

        logger.info(`${install.DisplayName} was installed successfully!`);


        // remove original/source extracted file
        shell.rm("-Rf", requiredFileAtFS)
        logger.info(`Removed file ${requiredFileAtFS}`)
      }

    }

    logger.info("All required softwares were installed successfully!");
  }

  /**
   * * This function gets list of required software that lacks its installation for the Kit
   * @param {Array} requiredPrograms
   */
  async function getNeededToInstall(requiredPrograms) {

    /**
     * * a list of installed software from the Running System
     */
    const installedPrograms = getAllInstalledSoftwareSync()

    /**
     * * verifies installed software (name and version) against required software and makes a list
     */
    const needToInstall = requiredPrograms.filter(reqProgram => {
      for (const installedProgram of installedPrograms) {
        if (
          installedProgram.DisplayName &&
          installedProgram.DisplayName.match(reqProgram.DisplayName) &&
          compareVersions.compare(reqProgram.DisplayVersion, installedProgram.DisplayVersion, reqProgram.comparatorVersion)
        ) {
          //** set up NODE enviroment PATH for application to run on scripts if one is not already in Windows PATH (INHERIT NODE PROCESS ENV PATH) */
          setPath(reqProgram.InstallLocation)
          return false
        }
      }
      // if cannot find a required software, it must install it
      return true
    })

    return needToInstall
  }


  function setPath(program) {

    if (!shell.env.PATH.includes(program)) {
      shell.echo(`added ${program} to ENV PATH`)
      shell.exec(`powershell -NoExit -Command "setx /M PATH '${shell.env.PATH};${program}';exit;"`)
      logger.log("info", "shell path modified: %s", shell.env.PATH = `${shell.env.PATH};${program}`)

    }
    else {
      shell.echo("No changes made to ENV PATH.")
    }

  }
}