const shell = require("shelljs")
const path = require("path")
const arch = require('arch')
const AdmZip = require('adm-zip');
const logger = require('./logger');


module.exports = async (data) => {
  const { driverLetter, rootDir } = data
  //* where to get compressed file with DLLs from
  // const rootDir = "C:\\MBD\\Install\\"
  const installDir = path.join(driverLetter, rootDir, "Install")
  //* path to compressed file
  const zipFile = path.join(installDir, "Dll's (_CAT_ & _Instal_).zip")
  logger.info(`extractAndDeployDLLs: rar ${zipFile}`)
  //* path destination where compressed files should be extracted
  const zipDest = path.resolve(`${installDir}`)


  // reading archives
  var zip = new AdmZip(zipFile)
  var [dllExtractedFolder] = zip.getEntries() // an array of ZipEntry records
  logger.info(`extractAndDeployDLLs: main -> dllExtractedFolder ${dllExtractedFolder.entryName}`)

  //* checking if 7z is installed
  logger.info(shell.which('7z'))
  const extractSh = shell.exec(`7z.exe e "${zipFile}" -o${zipDest} -r -y -spf`)

  if (extractSh.code === 0) {
    //* successful!
    logger.info(extractSh.stdout);
    logger.info("DLL Files extracted successfully.")

    //* copy DLLs from original/source folder to Windows folder according to PC Architecture (x86 or x64)
    const src = path.join(installDir, dllExtractedFolder.entryName)
    const sysPath = { x86: ['System32'], x64: ['System32', 'SysWOW64'] }
    const paths = sysPath[arch()]

    logger.info("Copying DLLs to System32 and SysWOW64")
    logger.info(`extractAndDeployDLLs: src -> ${src}`)
    logger.info(`extractAndDeployDLLs: dest -> ${paths}`)

    for (const path of paths) {
      logger.info(`extractAndDeployDLLs: Copy DLLs to path ${path}`)
      let copySh = shell.exec(`xcopy "${src}\\*.*" C:\\Windows\\${path} /f /y`)
      copySh.code !== 0 && logger.info(`Copy to ${path} failed. Error:  ${copySh.stderr}`);


      if (shell.exec(`Echo Get-ExecutionPolicy | PowerShell.exe -noprofile -`).stdout.match('Restricted')) {
        logger.info(shell.exec(`Echo Set-ExecutionPolicy Unrestricted | PowerShell.exe -noprofile -`).stdout)
      }

      //* register DLLs from original/source folder to Windows folder according to PC Architecture (x86 or x64)
      registerDLLs(path)
    }

    // remove original/source extracted folder and leave compressed file at same place
    shell.rm("-Rf", src)
    logger.info(`Removed ${src}`)
    return true
  }
  else {
    logger.info(extractSh.stderr);
    logger.info("DLL Files extraction failed. Do it yourself and don't forget to register them!! ")
    return false
  }

  function registerDLLs(path) {
    const dlls = [
      'capicom', 'msxml5', 'ssleay32', 'libeay32', 'midas'
    ]

    logger.info("extractAndDeployDLLs: registerDLLs -> path", path)
    for (const filename of dlls) {
      const registerSh = shell.exec(`regsvr32 %windir%\\${path}\\${filename}.dll /s`)
      if (registerSh.code !== 0) {
        logger.error(`extractAndDeployDLLs: registerDLLs -> error registering dll ${filename} at ${path}    error -> ${registerSh.stderr}`)
        logger.error(`You can try manually if you want to. Just copy/paste and execute this line in Command or Powershell:  regsvr32 %windir%\\${path}\\${filename}.dll /s`)
      } else {
        logger.info(`${filename}.dll registered successfully!`)
      }

    }


  }
}