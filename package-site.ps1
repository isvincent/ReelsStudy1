$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$zipPath = Join-Path (Split-Path -Parent $projectRoot) 'Reel影片製作_GitHub完整包.zip'
$rootNames = @('index.html','styles.css','app.js','i18n.js','manifest.webmanifest','sw.js','precache.js','.nojekyll','.gitignore','README.md','help.html','DESIGN.md','server.mjs','啟動學習網.cmd')
$files = @($rootNames | ForEach-Object { Get-Item -LiteralPath (Join-Path $projectRoot $_) })
$files += Get-Item -LiteralPath (Join-Path $projectRoot 'data/catalog.js')
$files += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'assets/videos') -File -Filter '*.mp4'
$files += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'assets/posters') -File -Filter '*.webp'
$files += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'assets/icons') -File
$files += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'assets/fonts') -File
$stream = [System.IO.File]::Open($zipPath,[System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($stream,[System.IO.Compression.ZipArchiveMode]::Create,$false,[System.Text.Encoding]::UTF8)
try { foreach ($file in $files) { $relative = $file.FullName.Substring($projectRoot.Length+1).Replace('\','/'); [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,$relative,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null } } finally { $archive.Dispose(); $stream.Dispose() }
$check = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try { if (($check.Entries | Where-Object FullName -Like '*.mp4').Count -ne 77) { throw 'MP4 count mismatch' }; if (($check.Entries | Where-Object FullName -Like '*.webp').Count -ne 77) { throw 'Poster count mismatch' }; if (-not ($check.Entries | Where-Object FullName -EQ '.nojekyll')) { throw 'Missing .nojekyll' }; Write-Output ('ZIP verified: '+$check.Entries.Count+' files, 77 videos and 77 posters') } finally { $check.Dispose() }
Get-Item -LiteralPath $zipPath | Select-Object FullName,Length
