[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$AssetsPath = (Join-Path (Split-Path $PSScriptRoot -Parent) 'assets')
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$assetsRoot = (Resolve-Path -LiteralPath $AssetsPath).Path
$seasonNames = @('winter', 'spring', 'summer', 'autumn')
$targets = @{
    player = 72
    characters = 66
    tiles = 66
}
$pngFiles = foreach ($seasonName in $seasonNames) {
    $seasonPath = Join-Path $assetsRoot $seasonName
    if (-not (Test-Path -LiteralPath $seasonPath -PathType Container)) {
        Write-Warning "Skipping missing season folder: $seasonPath"
        continue
    }

    Get-ChildItem -LiteralPath $seasonPath -Recurse -File -Filter '*.png'
}

foreach ($file in $pngFiles) {
    $relativePath = $file.FullName.Substring($assetsRoot.Length).TrimStart('\')
    $category = $null
    foreach ($candidate in $targets.Keys) {
        if ($relativePath -match "(?i)(^|\\)$candidate\\") {
            $category = $candidate
            break
        }
    }

    if (-not $category -and $relativePath -match '(?i)^[^\\]+\\[^\\]+-startTile\.png$') {
        $category = 'startTile'
    }

    if (-not $category) {
        Write-Warning "Skipping PNG outside a player, characters, tiles, or season start-marker folder: $relativePath"
        continue
    }

    $targetSize = if ($category -eq 'startTile') { 66 } else { $targets[$category] }
    $source = $null
    $canvas = $null
    $graphics = $null
    $tempPath = "$($file.FullName).normalizing.png"

    try {
        $source = [System.Drawing.Image]::FromFile($file.FullName)
        if ($source.Width -eq $targetSize -and $source.Height -eq $targetSize) {
            Write-Verbose "Already normalized: $relativePath ($targetSize x $targetSize)"
            continue
        }

        if (-not $PSCmdlet.ShouldProcess($relativePath, "Normalize to a transparent ${targetSize}x${targetSize} PNG")) {
            continue
        }

        $canvas = [System.Drawing.Bitmap]::new(
            $targetSize,
            $targetSize,
            [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
        )
        $graphics = [System.Drawing.Graphics]::FromImage($canvas)
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

        $scale = [Math]::Min($targetSize / [double]$source.Width, $targetSize / [double]$source.Height)
        $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))
        $x = [int][Math]::Floor(($targetSize - $width) / 2)
        $y = [int][Math]::Floor(($targetSize - $height) / 2)
        $destination = [System.Drawing.Rectangle]::new($x, $y, $width, $height)

        $graphics.DrawImage(
            $source,
            $destination,
            0,
            0,
            $source.Width,
            $source.Height,
            [System.Drawing.GraphicsUnit]::Pixel
        )
        $canvas.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)

        $graphics.Dispose()
        $graphics = $null
        $canvas.Dispose()
        $canvas = $null
        $source.Dispose()
        $source = $null

        Move-Item -LiteralPath $tempPath -Destination $file.FullName -Force
        Write-Output "$relativePath -> ${targetSize}x${targetSize}"
    }
    catch {
        if (Test-Path -LiteralPath $tempPath) {
            Remove-Item -LiteralPath $tempPath -Force
        }
        throw "Failed to normalize '$relativePath': $($_.Exception.Message)"
    }
    finally {
        if ($graphics) { $graphics.Dispose() }
        if ($canvas) { $canvas.Dispose() }
        if ($source) { $source.Dispose() }
    }
}
