param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing.dll -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public static class WordmarkExtractor
{
    public static void Extract(string sourcePath, string blackPath, string whitePath)
    {
        using (var source = new Bitmap(sourcePath))
        {
            var bounds = FindInkBounds(source);
            bounds.Inflate(24, 24);
            bounds.Intersect(new Rectangle(0, 0, source.Width, source.Height));

            using (var black = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb))
            using (var white = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb))
            {
                for (var y = 0; y < bounds.Height; y++)
                {
                    for (var x = 0; x < bounds.Width; x++)
                    {
                        var pixel = source.GetPixel(bounds.Left + x, bounds.Top + y);
                        var luminance = (pixel.R * 0.2126) + (pixel.G * 0.7152) + (pixel.B * 0.0722);
                        var alpha = (int)Math.Round((210.0 - luminance) * 5.5);
                        alpha = Math.Max(0, Math.Min(255, alpha));

                        if (alpha < 8)
                        {
                            alpha = 0;
                        }

                        black.SetPixel(x, y, Color.FromArgb(alpha, 18, 17, 15));
                        white.SetPixel(x, y, Color.FromArgb(alpha, 255, 249, 235));
                    }
                }

                black.Save(blackPath, ImageFormat.Png);
                white.Save(whitePath, ImageFormat.Png);
            }
        }
    }

    private static Rectangle FindInkBounds(Bitmap source)
    {
        var left = source.Width;
        var top = source.Height;
        var right = 0;
        var bottom = 0;

        for (var y = 0; y < source.Height; y += 2)
        {
            for (var x = 0; x < source.Width; x += 2)
            {
                var pixel = source.GetPixel(x, y);
                var luminance = (pixel.R * 0.2126) + (pixel.G * 0.7152) + (pixel.B * 0.0722);
                if (luminance > 180)
                {
                    continue;
                }

                left = Math.Min(left, x);
                top = Math.Min(top, y);
                right = Math.Max(right, x);
                bottom = Math.Max(bottom, y);
            }
        }

        if (right <= left || bottom <= top)
        {
            throw new InvalidOperationException("No ink pixels were detected in the source image.");
        }

        return Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
    }
}
'@

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$sourceCopy = Join-Path $OutputDirectory 'title-wordmark-source.png'
$blackOutput = Join-Path $OutputDirectory 'title-wordmark-ink.png'
$whiteOutput = Join-Path $OutputDirectory 'title-wordmark.png'

Copy-Item -LiteralPath $SourcePath -Destination $sourceCopy -Force
[WordmarkExtractor]::Extract($sourceCopy, $blackOutput, $whiteOutput)

Get-Item -LiteralPath $sourceCopy, $blackOutput, $whiteOutput |
  Select-Object FullName, Length
