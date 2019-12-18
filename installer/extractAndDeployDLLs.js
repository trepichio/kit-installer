const shell = require("shelljs")
const path = require("path")
const arch = require('arch')
const AdmZip = require('adm-zip');

module.exports = () => {
  //* where to get compressed file with DLLs from
  const rootDir = "C:\\MBD\\Install\\"
  //* path to compressed file
  const zipFile = path.join(rootDir, "Dll's (_CAT_ & _Instal_).zip")
  console.log("TCL: rar", zipFile)
  //* path destination where compressed files should be extracted
  const zipDest = path.resolve(`${rootDir}`)


  // reading archives
  var zip = new AdmZip(zipFile)
  var [dllExtractedFolder] = zip.getEntries() // an array of ZipEntry records
  console.log("TCL: main -> dllExtractedFolder", dllExtractedFolder.entryName)

  //* checking if 7z is installed
  console.log(shell.which('7z'))
  const extractSh = shell.exec(`7z.exe e "${zipFile}" -o${zipDest} -r -y -spf`)

  if (extractSh.code === 0) {
    //* successful!
    console.log(extractSh.stdout);
    console.log("DLL Files extracted successfully.")

    //* copy DLLs from original/source folder to Windows folder according to PC Architecture (x86 or x64)
    const src = path.join(rootDir, dllExtractedFolder.entryName)
    const sysPath = { x86: ['System32'], x64: ['System32', 'SysWOW64'] }
    const paths = sysPath[arch()]

    console.log("Copying DLLs to System32 and SysWOW64")
    console.log("TCL: src", src)
    console.log("TCL: dest", paths)

    for (const path of paths) {
      console.log("TCL Copy DLL: path", path)
      let copySh = shell.exec(`xcopy "${src}\\*.*" C:\\Windows\\${path} /f /y`)
      copySh.code !== 0 && console.log(`Copy to ${path} failed. Error:  ${copySh.stderr}`);


      if (shell.exec(`Echo Get-ExecutionPolicy | PowerShell.exe -noprofile -`).stdout.match('Restricted')) {
        console.log(shell.exec(`Echo Set-ExecutionPolicy Unrestricted | PowerShell.exe -noprofile -`).stdout)
      }

      //* register DLLs from original/source folder to Windows folder according to PC Architecture (x86 or x64)
      registerDLLs(path)
    }

    // remove original/source extracted folder and leave compressed file at same place
    shell.rm("-Rf", src)
    console.log(`Removed ${src}`)
  }
  else {
    console.log(extractSh.stderr);
    console.log("DLL Files extraction failed. Do it yourself and don't forget to register them!! ")
  }

  function registerDLLs(path) {
    console.log("TCL: registerDLLs -> path", path)

    shell.exec(`regsvr32 %windir%\\${path}\\capicom.dll /s`) && console.log("registering capicom.dll");

    shell.exec(`regsvr32 %windir%\\${path}\\msxml5.dll /s`) && console.log("registering msxml5.dll");

    shell.exec(`regsvr32 %windir%\\${path}\\ssleay32.dll /s`) && console.log("registering ssleay32.dll");

    shell.exec(`regsvr32 %windir%\\${path}\\libeay32.dll /s`) && console.log("registering libeay32.dll");

    shell.exec(`regsvr32 %windir%\\${path}\\midas.dll /s`) && console.log("registering midas.dll");
  }
}