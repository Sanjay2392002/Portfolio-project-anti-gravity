param (
    [string]$SourcePath,
    [string]$DestinationPath,
    [int]$MaxDimension = 1600,
    [int]$Quality = 88
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
    Write-Error "Source not found: $SourcePath"
    exit 1
}

$destDir = Split-Path -Parent $DestinationPath
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$img = [System.Drawing.Image]::FromFile($SourcePath)
$w = $img.Width
$h = $img.Height

if ($w -gt $MaxDimension -or $h -gt $MaxDimension) {
    if ($w -gt $h) {
        $newW = $MaxDimension
        $newH = [int]($h * ($MaxDimension / $w))
    } else {
        $newH = $MaxDimension
        $newW = [int]($w * ($MaxDimension / $h))
    }
} else {
    $newW = $w
    $newH = $h
}

$bmp = New-Object System.Drawing.Bitmap $newW, $newH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.DrawImage($img, 0, 0, $newW, $newH)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), [long]$Quality

$bmp.Save($DestinationPath, $codec, $encParams)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()

$srcSize = (Get-Item $SourcePath).Length / 1MB
$destSize = (Get-Item $DestinationPath).Length / 1KB
Write-Host "Success: $SourcePath ($($srcSize.ToString('F2')) MB) -> $DestinationPath ($($destSize.ToString('F2')) KB, ${newW}x${newH})"
