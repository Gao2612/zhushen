const { execSync } = require('child_process');
// Check EXIF orientation of the splash image
const out = execSync('powershell -Command "Add-Type -AssemblyName System.Drawing; $img = New-Object System.Drawing.Bitmap(\'C:/Users/EDY/Desktop/登入界面.jpg\'); Write-Host (\'Width=\' + $img.Width + \' Height=\' + $img.Height + \' RawFormat=\' + $img.RawFormat); $props = $img.PropertyItems; foreach($p in $props) { if($p.Id -eq 0x0112) { Write-Host (\'Orientation=\' + $p.Value[0]) } } $img.Dispose()"');
console.log(out.toString());
