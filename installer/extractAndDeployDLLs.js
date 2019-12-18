const shell = require("shelljs")
const path = require("path")
const arch = require('arch')
const AdmZip = require('adm-zip');

module.exports = () => {
  const rootDir = "C:\\MBD\\Install\\"
  const zipFile = path.join(rootDir, "Dll's (_CAT_ & _Instal_).zip")
  console.log("TCL: rar", zipFile)
  const zipDest = path.resolve(`${rootDir}`)


  // reading archives
  var zip = new AdmZip(zipFile)
  var [dllExtractedFolder] = zip.getEntries() // an array of ZipEntry records
  console.log("TCL: main -> dllExtractedFolder", dllExtractedFolder.entryName)

  console.log(shell.which('7z'))
  const extractSh = shell.exec(`7z.exe e "${zipFile}" -o${zipDest} -r -y -spf`)
  if (extractSh.code === 0) {
    console.log(extractSh.stdout);
    console.log("DLL Files extracted successfully.")

    const src = path.join(rootDir, dllExtractedFolder.entryName)
    const dest = {
      sys32: path.resolve(`C:\\Windows\\System32`),
      sys64: path.resolve(`C:\\Windows\\SysWOW64`)
    }
    console.log("TCL: src", src)
    console.log("TCL: dest", dest)
    console.log("Copying DLLs to System32 and SysWOW64")

    const copyx86Sh = shell.exec(`xcopy "${src}\\*.*" ${dest.sys32} /f /y`)

    copyx86Sh.code !== 0 && console.log("Copy to System32 failed. Error:", copyx86Sh.stderr);

    const copyx64Sh = shell.exec(`xcopy "${src}\\*.*" ${dest.sys64} /f /y`)

    copyx64Sh.code !== 0 && console.log("Copy to SysWOW64 failed. Error:", copyx64Sh.stderr);

    shell.rm("-Rf", src)
    console.log(`Removed ${src}`)

    registerDLLs()
  }
  else {
    console.log(extractSh.stderr);
    console.log("DLL Files extraction failed. Do it yourself and don't forget to register them!! ")

  }

  function registerDLLs() {

    const sysPath = { x86: ['System32'], x64: ['System32', 'SysWOW64'] }
    const paths = sysPath[arch()]
    for (const path of paths) {
      console.log("TCL: registerDLLs -> path", path)

      shell.exec(`regsvr32 %windir%\\${path}\\capicom.dll /s`) && console.log("registering capicom.dll");

      shell.exec(`regsvr32 %windir%\\${path}\\msxml5.dll /s`) && console.log("registering msxml5.dll");

      shell.exec(`regsvr32 %windir%\\${path}\\ssleay32.dll /s`) && console.log("registering ssleay32.dll");

      shell.exec(`regsvr32 %windir%\\${path}\\libeay32.dll /s`) && console.log("registering libeay32.dll");

      shell.exec(`regsvr32 %windir%\\${path}\\midas.dll /s`) && console.log("registering midas.dll");
    }
  }
}