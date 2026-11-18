<#
  generate_icons.ps1 - BeanTelligence v6.0 Zero-Node App Icon & PWA Asset Rasterizer
  Renders "The Refracting Prism Drop" Official BeanTelligence v6.0 Mark:
    - Faceted obsidian-mahogany & burnished-copper crystal extraction drop
    - Crisp incoming precision collimator beam & incandescent inner diamond core
    - 3 luminous spectral flavor waves (Gold Citrus Acids, Copper Caramel Sugars, Emerald-Sweet Body)
    - Golden meniscus harmonic ripple (zero <clipPath>, 100% pure crystal optics)

  Supports:
    - Default instant .NET System.Drawing GDI+ super-sampled vector renderer (<80 ms)
    - Optional -UseHeadlessEdge SVG-to-Canvas V8/Blink rasterizer (syncing BTBrand.masterIconSvg)

  Emits:
    - icon-180.png          (180x180 iOS apple-touch-icon & manifest)
    - icon-192.png          (192x192 PWA standard icon)
    - icon-512.png          (512x512 PWA splash & store icon)
    - icon-maskable-512.png (512x512 Android/PWA safe-zone maskable icon)
    - icon-1024.png         (1024x1024 App Store & hi-res master icon)
  Optional (-IncludeMobile):
    - icon-ios-light-1024.png, icon-ios-dark-1024.png, icon-ios-tinted-1024.png
    - ic_launcher_foreground.png, ic_launcher_background.png, ic_launcher_monochrome.png
#>
param(
  [string]$OutDir = '',
  [string]$BrandJsPath = '',
  [switch]$IncludeMobile,
  [switch]$UseHeadlessEdge,
  [switch]$ForceDotNet
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $root 'icons' }
if (-not $BrandJsPath) { $BrandJsPath = Join-Path $root 'src\v6\ui\01-brand-beanjamin-icons.js' }

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

Add-Type -AssemblyName System.Drawing

if (-not ('BtPrismDropIconRenderer' -as [type])) {
  Add-Type -ReferencedAssemblies 'System.Drawing' -Language CSharp -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class BtPrismDropIconRenderer {
  private static PointF[] CrownLeftFacet() {
    return new PointF[] {
      new PointF(468f, 148f),
      new PointF(342f, 386f),
      new PointF(388f, 496f),
      new PointF(468f, 344f)
    };
  }

  private static PointF[] CrownRightFacet() {
    return new PointF[] {
      new PointF(468f, 148f),
      new PointF(468f, 344f),
      new PointF(548f, 496f),
      new PointF(594f, 386f)
    };
  }

  private static PointF[] PavilionLeftFacet() {
    return new PointF[] {
      new PointF(342f, 386f),
      new PointF(298f, 536f),
      new PointF(362f, 684f),
      new PointF(468f, 748f),
      new PointF(468f, 632f),
      new PointF(388f, 496f)
    };
  }

  private static PointF[] PavilionRightFacet() {
    return new PointF[] {
      new PointF(594f, 386f),
      new PointF(548f, 496f),
      new PointF(468f, 632f),
      new PointF(468f, 748f),
      new PointF(574f, 684f),
      new PointF(638f, 536f)
    };
  }

  private static PointF[] InnerDiamondFacet() {
    return new PointF[] {
      new PointF(468f, 344f),
      new PointF(548f, 496f),
      new PointF(468f, 632f),
      new PointF(388f, 496f)
    };
  }

  private static PointF[] IncidentBeamPolygon() {
    return new PointF[] {
      new PointF(108f, 516f),
      new PointF(388f, 482f),
      new PointF(388f, 510f),
      new PointF(108f, 546f)
    };
  }

  private static PointF[] InternalDispersionFan() {
    return new PointF[] {
      new PointF(388f, 496f),
      new PointF(548f, 456f),
      new PointF(548f, 536f)
    };
  }

  private static GraphicsPath BuildWaveGoldAcids() {
    var gp = new GraphicsPath();
    gp.StartFigure();
    gp.AddBezier(548f, 456f, 652f, 408f, 764f, 302f, 902f, 294f);
    gp.AddBezier(902f, 294f, 916f, 293f, 918f, 316f, 902f, 322f);
    gp.AddBezier(902f, 322f, 768f, 346f, 662f, 444f, 548f, 484f);
    gp.CloseFigure();
    return gp;
  }

  private static GraphicsPath BuildWaveCopperSugars() {
    var gp = new GraphicsPath();
    gp.StartFigure();
    gp.AddBezier(548f, 483f, 668f, 464f, 786f, 496f, 918f, 478f);
    gp.AddBezier(918f, 478f, 932f, 476f, 932f, 502f, 916f, 506f);
    gp.AddBezier(916f, 506f, 784f, 534f, 668f, 504f, 548f, 511f);
    gp.CloseFigure();
    return gp;
  }

  private static GraphicsPath BuildWaveEmeraldBody() {
    var gp = new GraphicsPath();
    gp.StartFigure();
    gp.AddBezier(548f, 510f, 662f, 548f, 768f, 642f, 900f, 662f);
    gp.AddBezier(900f, 662f, 916f, 665f, 914f, 690f, 896f, 689f);
    gp.AddBezier(896f, 689f, 754f, 676f, 650f, 586f, 548f, 538f);
    gp.CloseFigure();
    return gp;
  }

  private static GraphicsPath BuildMeniscusPrimary() {
    var gp = new GraphicsPath();
    gp.StartFigure();
    gp.AddBezier(272f, 804f, 344f, 844f, 592f, 844f, 664f, 804f);
    gp.AddBezier(664f, 804f, 672f, 799f, 678f, 811f, 668f, 819f);
    gp.AddBezier(668f, 819f, 588f, 868f, 348f, 868f, 268f, 819f);
    gp.AddBezier(268f, 819f, 258f, 811f, 264f, 799f, 272f, 804f);
    gp.CloseFigure();
    return gp;
  }

  private static GraphicsPath BuildMeniscusEcho() {
    var gp = new GraphicsPath();
    gp.StartFigure();
    gp.AddBezier(346f, 868f, 404f, 892f, 532f, 892f, 590f, 868f);
    gp.AddBezier(590f, 868f, 596f, 865f, 600f, 874f, 592f, 879f);
    gp.AddBezier(592f, 879f, 530f, 908f, 406f, 908f, 344f, 879f);
    gp.CloseFigure();
    return gp;
  }

  public static void RenderPng(string outPath, int targetSize, string variant) {
    int masterSize = targetSize >= 512 ? 1024 : 512;
    using (var master = new Bitmap(masterSize, masterSize, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(master)) {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.CompositingQuality = CompositingQuality.HighQuality;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;

        float unitScale = masterSize / 1024f;
        g.ScaleTransform(unitScale, unitScale);

        bool isLight = variant == "light";
        bool isTinted = variant == "tinted";
        bool isFgOnly = variant == "android-fg";
        bool isBgOnly = variant == "android-bg";
        bool isMono = variant == "android-mono";
        bool isMaskable = variant == "maskable";

        if (isFgOnly || isTinted || isMono) {
          g.Clear(Color.Transparent);
        } else if (isLight) {
          using (var bg = new LinearGradientBrush(new Rectangle(0, 0, 1024, 1024), Color.FromArgb(255, 255, 253, 249), Color.FromArgb(255, 228, 209, 184), LinearGradientMode.ForwardDiagonal)) {
            bg.WrapMode = WrapMode.TileFlipXY;
            var cb = new ColorBlend(3);
            cb.Colors = new Color[] { Color.FromArgb(255, 255, 253, 249), Color.FromArgb(255, 245, 236, 224), Color.FromArgb(255, 228, 209, 184) };
            cb.Positions = new float[] { 0f, 0.55f, 1f };
            bg.InterpolationColors = cb;
            g.FillRectangle(bg, 0, 0, 1024, 1024);
          }
        } else {
          using (var bg = new LinearGradientBrush(new Rectangle(0, 0, 1024, 1024), Color.FromArgb(255, 36, 23, 16), Color.FromArgb(255, 8, 5, 4), LinearGradientMode.ForwardDiagonal)) {
            bg.WrapMode = WrapMode.TileFlipXY;
            var cb = new ColorBlend(3);
            cb.Colors = new Color[] { Color.FromArgb(255, 36, 23, 16), Color.FromArgb(255, 18, 11, 8), Color.FromArgb(255, 8, 5, 4) };
            cb.Positions = new float[] { 0f, 0.54f, 1f };
            bg.InterpolationColors = cb;
            g.FillRectangle(bg, 0, 0, 1024, 1024);
          }
          using (var glowPath = new GraphicsPath()) {
            glowPath.AddEllipse(130f, 110f, 780f, 780f);
            using (var pgb = new PathGradientBrush(glowPath)) {
              pgb.CenterPoint = new PointF(528f, 496f);
              pgb.CenterColor = Color.FromArgb(52, 232, 124, 46);
              pgb.SurroundColors = new Color[] { Color.FromArgb(0, 18, 11, 8) };
              g.FillPath(pgb, glowPath);
            }
          }
        }

        if (isBgOnly) {
          SaveScaled(master, outPath, targetSize);
          return;
        }

        if (isMaskable) {
          g.TranslateTransform(512f, 512f);
          g.ScaleTransform(0.75f, 0.75f);
          g.TranslateTransform(-512f, -512f);
        } else if (isFgOnly || isMono) {
          g.TranslateTransform(512f, 512f);
          g.ScaleTransform(0.62f, 0.62f);
          g.TranslateTransform(-512f, -512f);
        }

        using (var waveGold = BuildWaveGoldAcids())
        using (var waveCopper = BuildWaveCopperSugars())
        using (var waveEmerald = BuildWaveEmeraldBody())
        using (var menMain = BuildMeniscusPrimary())
        using (var menEcho = BuildMeniscusEcho()) {
          if (isMono) {
            using (var mBr = new SolidBrush(Color.FromArgb(255, 0, 0, 0))) {
              g.FillPolygon(mBr, CrownLeftFacet());
              g.FillPolygon(mBr, CrownRightFacet());
              g.FillPolygon(mBr, PavilionLeftFacet());
              g.FillPolygon(mBr, PavilionRightFacet());
              g.FillPolygon(mBr, IncidentBeamPolygon());
              g.FillPath(mBr, waveGold);
              g.FillPath(mBr, waveCopper);
              g.FillPath(mBr, waveEmerald);
              g.FillPath(mBr, menMain);
            }
          } else if (isTinted) {
            using (var w100 = new SolidBrush(Color.FromArgb(255, 255, 255, 255)))
            using (var w84  = new SolidBrush(Color.FromArgb(214, 255, 255, 255)))
            using (var w68  = new SolidBrush(Color.FromArgb(174, 255, 255, 255)))
            using (var w52  = new SolidBrush(Color.FromArgb(132, 255, 255, 255))) {
              g.FillPolygon(w84, CrownLeftFacet());
              g.FillPolygon(w68, CrownRightFacet());
              g.FillPolygon(w52, PavilionLeftFacet());
              g.FillPolygon(w68, PavilionRightFacet());
              g.FillPolygon(w100, InnerDiamondFacet());
              g.FillPolygon(w100, IncidentBeamPolygon());
              g.FillPath(w100, waveGold);
              g.FillPath(w84, waveCopper);
              g.FillPath(w68, waveEmerald);
              g.FillPath(w84, menMain);
            }
          } else {
            Color cL1 = isLight ? Color.FromArgb(255, 118, 62, 30) : Color.FromArgb(255, 247, 212, 168);
            Color cL2 = isLight ? Color.FromArgb(255, 59, 28, 11)  : Color.FromArgb(255, 178, 102, 48);
            Color cR1 = isLight ? Color.FromArgb(255, 212, 98, 30) : Color.FromArgb(255, 236, 140, 58);
            Color cR2 = isLight ? Color.FromArgb(255, 120, 44, 10) : Color.FromArgb(255, 138, 54, 16);
            Color pL1 = isLight ? Color.FromArgb(255, 58, 27, 12)  : Color.FromArgb(255, 106, 52, 24);
            Color pL2 = isLight ? Color.FromArgb(255, 26, 11, 4)   : Color.FromArgb(255, 38, 17, 8);
            Color pR1 = isLight ? Color.FromArgb(255, 168, 72, 22) : Color.FromArgb(255, 196, 91, 28);
            Color pR2 = isLight ? Color.FromArgb(255, 72, 26, 8)   : Color.FromArgb(255, 76, 28, 9);

            using (var brCL = new LinearGradientBrush(new PointF(320f, 130f), new PointF(488f, 516f), cL1, cL2))
            using (var brCR = new LinearGradientBrush(new PointF(450f, 130f), new PointF(614f, 516f), cR1, cR2))
            using (var brPL = new LinearGradientBrush(new PointF(280f, 366f), new PointF(488f, 768f), pL1, pL2))
            using (var brPR = new LinearGradientBrush(new PointF(658f, 366f), new PointF(448f, 768f), pR1, pR2))
            using (var brDia = new LinearGradientBrush(new PointF(370f, 326f), new PointF(566f, 650f), Color.FromArgb(255, 255, 246, 226), Color.FromArgb(255, 216, 104, 30)))
            using (var brFan = new LinearGradientBrush(new PointF(378f, 496f), new PointF(560f, 496f), Color.FromArgb(220, 255, 252, 244), Color.FromArgb(190, 250, 198, 102)))
            using (var brBeam = new LinearGradientBrush(new PointF(88f, 534f), new PointF(404f, 494f), isLight ? Color.FromArgb(220, 154, 66, 18) : Color.FromArgb(140, 248, 216, 168), isLight ? Color.FromArgb(255, 235, 158, 52) : Color.FromArgb(255, 255, 253, 249)))
            using (var brGold = new LinearGradientBrush(new PointF(532f, 488f), new PointF(956f, 286f), Color.FromArgb(255, 255, 243, 184), Color.FromArgb(255, 235, 152, 30)))
            using (var brCop  = new LinearGradientBrush(new PointF(532f, 496f), new PointF(964f, 492f), Color.FromArgb(255, 255, 208, 138), Color.FromArgb(255, 204, 82, 22)))
            using (var brEm   = new LinearGradientBrush(new PointF(532f, 506f), new PointF(952f, 704f), Color.FromArgb(255, 168, 240, 208), Color.FromArgb(255, 28, 156, 114)))
            using (var brMen  = new LinearGradientBrush(new PointF(236f, 820f), new PointF(700f, 820f), Color.FromArgb(255, 194, 96, 28), Color.FromArgb(255, 250, 214, 125)))
            using (var brEcho = new SolidBrush(Color.FromArgb(128, 235, 164, 68)))
            using (var arrisPen = new Pen(Color.FromArgb(isLight ? 95 : 135, 255, 248, 234), 3.6f))
            using (var sparkBr = new SolidBrush(Color.FromArgb(245, 255, 253, 249))) {
              brCL.WrapMode = WrapMode.TileFlipXY;
              brCR.WrapMode = WrapMode.TileFlipXY;
              brPL.WrapMode = WrapMode.TileFlipXY;
              brPR.WrapMode = WrapMode.TileFlipXY;
              brDia.WrapMode = WrapMode.TileFlipXY;
              brBeam.WrapMode = WrapMode.TileFlipXY;
              brGold.WrapMode = WrapMode.TileFlipXY;
              brCop.WrapMode = WrapMode.TileFlipXY;
              brEm.WrapMode = WrapMode.TileFlipXY;
              brMen.WrapMode = WrapMode.TileFlipXY;
              arrisPen.LineJoin = LineJoin.Round;
              g.FillPolygon(brCL, CrownLeftFacet());
              g.FillPolygon(brCR, CrownRightFacet());
              g.FillPolygon(brPL, PavilionLeftFacet());
              g.FillPolygon(brPR, PavilionRightFacet());
              g.FillPolygon(brDia, InnerDiamondFacet());
              g.FillPolygon(brFan, InternalDispersionFan());

              g.DrawPolygon(arrisPen, InnerDiamondFacet());
              g.DrawLine(arrisPen, 468f, 148f, 468f, 344f);
              g.DrawLine(arrisPen, 468f, 632f, 468f, 748f);
              g.DrawLine(arrisPen, 468f, 148f, 342f, 386f);

              g.FillPolygon(brBeam, IncidentBeamPolygon());
              g.FillPath(brGold, waveGold);
              g.FillPath(brCop, waveCopper);
              g.FillPath(brEm, waveEmerald);

              g.FillEllipse(sparkBr, 548f - 11f, 496f - 11f, 22f, 22f);
              g.FillEllipse(sparkBr, 388f - 7.5f, 496f - 7.5f, 15f, 15f);

              g.FillPath(brMen, menMain);
              g.FillPath(brEcho, menEcho);
            }
          }
        }
      }
      SaveScaled(master, outPath, targetSize);
    }
  }

  public static void SaveScaled(Bitmap src, string outPath, int size) {
    if (src.Width == size && src.Height == size) {
      src.Save(outPath, ImageFormat.Png);
      return;
    }
    using (var dst = new Bitmap(size, size, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(dst)) {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.CompositingQuality = CompositingQuality.HighQuality;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.DrawImage(src, new Rectangle(0, 0, size, size), new Rectangle(0, 0, src.Width, src.Height), GraphicsUnit.Pixel);
      }
      dst.Save(outPath, ImageFormat.Png);
    }
  }
}
'@
}

$masterDarkSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bt_prD_bg" x1="0.16" y1="0.03" x2="0.84" y2="0.97">
      <stop offset="0%" stop-color="#241710"/>
      <stop offset="54%" stop-color="#120B08"/>
      <stop offset="100%" stop-color="#080504"/>
    </linearGradient>
    <radialGradient id="bt_prD_glow" cx="0.54" cy="0.48" r="0.46">
      <stop offset="0%" stop-color="#E87C2E" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#120B08" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bt_prD_cl" x1="0.2" y1="0.05" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#F7D4A8"/>
      <stop offset="100%" stop-color="#B26630"/>
    </linearGradient>
    <linearGradient id="bt_prD_cr" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
      <stop offset="0%" stop-color="#EC8C3A"/>
      <stop offset="100%" stop-color="#8A3610"/>
    </linearGradient>
    <linearGradient id="bt_prD_pl" x1="0.1" y1="0.1" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#6A3418"/>
      <stop offset="100%" stop-color="#261108"/>
    </linearGradient>
    <linearGradient id="bt_prD_pr" x1="0.9" y1="0.1" x2="0.1" y2="0.95">
      <stop offset="0%" stop-color="#C45B1C"/>
      <stop offset="100%" stop-color="#4C1C09"/>
    </linearGradient>
    <linearGradient id="bt_prD_dia" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
      <stop offset="0%" stop-color="#FFF6E2"/>
      <stop offset="52%" stop-color="#F5AE48"/>
      <stop offset="100%" stop-color="#D8681E"/>
    </linearGradient>
    <linearGradient id="bt_prD_beam" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#F8D8A8" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#FFFDF9"/>
    </linearGradient>
    <linearGradient id="bt_prD_w1" x1="0" y1="0.8" x2="1" y2="0.1">
      <stop offset="0%" stop-color="#FFF3B8"/>
      <stop offset="55%" stop-color="#F7BD3E"/>
      <stop offset="100%" stop-color="#EB981E"/>
    </linearGradient>
    <linearGradient id="bt_prD_w2" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#FFD08A"/>
      <stop offset="55%" stop-color="#E87C2E"/>
      <stop offset="100%" stop-color="#CC5216"/>
    </linearGradient>
    <linearGradient id="bt_prD_w3" x1="0" y1="0.2" x2="1" y2="0.9">
      <stop offset="0%" stop-color="#A8F0D0"/>
      <stop offset="55%" stop-color="#38B889"/>
      <stop offset="100%" stop-color="#1C9C72"/>
    </linearGradient>
    <linearGradient id="bt_prD_men" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#C2601C"/>
      <stop offset="50%" stop-color="#FAD67D"/>
      <stop offset="100%" stop-color="#E89B3C"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bt_prD_bg)"/>
  <rect width="1024" height="1024" fill="url(#bt_prD_glow)"/>
  <polygon points="468,148 342,386 388,496 468,344" fill="url(#bt_prD_cl)"/>
  <polygon points="468,148 468,344 548,496 594,386" fill="url(#bt_prD_cr)"/>
  <polygon points="342,386 298,536 362,684 468,748 468,632 388,496" fill="url(#bt_prD_pl)"/>
  <polygon points="594,386 548,496 468,632 468,748 574,684 638,536" fill="url(#bt_prD_pr)"/>
  <polygon points="468,344 548,496 468,632 388,496" fill="url(#bt_prD_dia)"/>
  <polygon points="388,496 548,456 548,536" fill="#FFFDF9" fill-opacity="0.78"/>
  <g fill="none" stroke="#FFF8EA" stroke-width="3.6" stroke-linejoin="round" opacity="0.55">
    <polygon points="468,344 548,496 468,632 388,496"/>
    <line x1="468" y1="148" x2="468" y2="344"/>
    <line x1="468" y1="632" x2="468" y2="748"/>
    <line x1="468" y1="148" x2="342" y2="386"/>
  </g>
  <polygon points="108,516 388,482 388,510 108,546" fill="url(#bt_prD_beam)"/>
  <path d="M 548 456 C 652 408 764 302 902 294 C 916 293 918 316 902 322 C 768 346 662 444 548 484 Z" fill="url(#bt_prD_w1)"/>
  <path d="M 548 483 C 668 464 786 496 918 478 C 932 476 932 502 916 506 C 784 534 668 504 548 511 Z" fill="url(#bt_prD_w2)"/>
  <path d="M 548 510 C 662 548 768 642 900 662 C 916 665 914 690 896 689 C 754 676 650 586 548 538 Z" fill="url(#bt_prD_w3)"/>
  <circle cx="548" cy="496" r="11" fill="#FFFDF9"/>
  <circle cx="388" cy="496" r="7.5" fill="#FFFDF9"/>
  <path d="M 272 804 C 344 844 592 844 664 804 C 672 799 678 811 668 819 C 588 868 348 868 268 819 C 258 811 264 799 272 804 Z" fill="url(#bt_prD_men)"/>
  <path d="M 346 868 C 404 892 532 892 590 868 C 596 865 600 874 592 879 C 530 908 406 908 344 879 Z" fill="#EBA444" fill-opacity="0.50"/>
</svg>
'@

$masterMaskableSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bt_prM_bg" x1="0.16" y1="0.03" x2="0.84" y2="0.97">
      <stop offset="0%" stop-color="#241710"/>
      <stop offset="54%" stop-color="#120B08"/>
      <stop offset="100%" stop-color="#080504"/>
    </linearGradient>
    <linearGradient id="bt_prM_cl" x1="0.2" y1="0.05" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#F7D4A8"/>
      <stop offset="100%" stop-color="#B26630"/>
    </linearGradient>
    <linearGradient id="bt_prM_cr" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
      <stop offset="0%" stop-color="#EC8C3A"/>
      <stop offset="100%" stop-color="#8A3610"/>
    </linearGradient>
    <linearGradient id="bt_prM_pl" x1="0.1" y1="0.1" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#6A3418"/>
      <stop offset="100%" stop-color="#261108"/>
    </linearGradient>
    <linearGradient id="bt_prM_pr" x1="0.9" y1="0.1" x2="0.1" y2="0.95">
      <stop offset="0%" stop-color="#C45B1C"/>
      <stop offset="100%" stop-color="#4C1C09"/>
    </linearGradient>
    <linearGradient id="bt_prM_dia" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
      <stop offset="0%" stop-color="#FFF6E2"/>
      <stop offset="52%" stop-color="#F5AE48"/>
      <stop offset="100%" stop-color="#D8681E"/>
    </linearGradient>
    <linearGradient id="bt_prM_beam" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#F8D8A8" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#FFFDF9"/>
    </linearGradient>
    <linearGradient id="bt_prM_w1" x1="0" y1="0.8" x2="1" y2="0.1">
      <stop offset="0%" stop-color="#FFF3B8"/>
      <stop offset="55%" stop-color="#F7BD3E"/>
      <stop offset="100%" stop-color="#EB981E"/>
    </linearGradient>
    <linearGradient id="bt_prM_w2" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#FFD08A"/>
      <stop offset="55%" stop-color="#E87C2E"/>
      <stop offset="100%" stop-color="#CC5216"/>
    </linearGradient>
    <linearGradient id="bt_prM_w3" x1="0" y1="0.2" x2="1" y2="0.9">
      <stop offset="0%" stop-color="#A8F0D0"/>
      <stop offset="55%" stop-color="#38B889"/>
      <stop offset="100%" stop-color="#1C9C72"/>
    </linearGradient>
    <linearGradient id="bt_prM_men" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#C2601C"/>
      <stop offset="50%" stop-color="#FAD67D"/>
      <stop offset="100%" stop-color="#E89B3C"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bt_prM_bg)"/>
  <g transform="translate(512 512) scale(0.75) translate(-512 -512)">
    <polygon points="468,148 342,386 388,496 468,344" fill="url(#bt_prM_cl)"/>
    <polygon points="468,148 468,344 548,496 594,386" fill="url(#bt_prM_cr)"/>
    <polygon points="342,386 298,536 362,684 468,748 468,632 388,496" fill="url(#bt_prM_pl)"/>
    <polygon points="594,386 548,496 468,632 468,748 574,684 638,536" fill="url(#bt_prM_pr)"/>
    <polygon points="468,344 548,496 468,632 388,496" fill="url(#bt_prM_dia)"/>
    <polygon points="388,496 548,456 548,536" fill="#FFFDF9" fill-opacity="0.78"/>
    <polygon points="108,516 388,482 388,510 108,546" fill="url(#bt_prM_beam)"/>
    <path d="M 548 456 C 652 408 764 302 902 294 C 916 293 918 316 902 322 C 768 346 662 444 548 484 Z" fill="url(#bt_prM_w1)"/>
    <path d="M 548 483 C 668 464 786 496 918 478 C 932 476 932 502 916 506 C 784 534 668 504 548 511 Z" fill="url(#bt_prM_w2)"/>
    <path d="M 548 510 C 662 548 768 642 900 662 C 916 665 914 690 896 689 C 754 676 650 586 548 538 Z" fill="url(#bt_prM_w3)"/>
    <circle cx="548" cy="496" r="11" fill="#FFFDF9"/>
    <circle cx="388" cy="496" r="7.5" fill="#FFFDF9"/>
    <path d="M 272 804 C 344 844 592 844 664 804 C 672 799 678 811 668 819 C 588 868 348 868 268 819 C 258 811 264 799 272 804 Z" fill="url(#bt_prM_men)"/>
  </g>
</svg>
'@

$edgePaths = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$edgeExe = if ((-not $UseHeadlessEdge) -or $ForceDotNet) { $null } else { $edgePaths | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1 }

$usedEdge = $false
if ($edgeExe) {
  $tmpBase = Join-Path $OutDir ('_tmp_ic_' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tmpBase -Force | Out-Null
  $tmpHtml = Join-Path $tmpBase 'gen.html'
  $tmpProf = Join-Path $tmpBase 'prof'
  $tmpOut  = Join-Path $tmpBase 'out.txt'
  $tmpErr  = Join-Path $tmpBase 'err.txt'
  New-Item -ItemType Directory -Path $tmpProf -Force | Out-Null

  try {
    $b64Dark = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($masterDarkSvg))
    $b64Mask = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($masterMaskableSvg))
    $brandScriptTag = ''
    if (Test-Path -LiteralPath $BrandJsPath) {
      $brandJsRaw = [System.IO.File]::ReadAllText($BrandJsPath, [System.Text.Encoding]::UTF8)
      # Pull BTBrand.masterIconSvg once 01-brand-beanjamin-icons.js exposes "The Refracting Prism Drop"
      if ($brandJsRaw -match 'Refracting Prism Drop') {
        $brandScriptTag = "<script>`ntry {`n$brandJsRaw`n} catch(e) {}`n</script>"
      }
    }

    $htmlContent = @"
<!doctype html><html><body>
<pre id="iconResult">PENDING</pre>
$brandScriptTag
<script>
(async function(){
  function loadImg(svgText){
    return new Promise(function(resolve, reject){
      const img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
    });
  }
  function renderSize(img, size, scaleSafe){
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (scaleSafe){
      ctx.fillStyle = '#120B08';
      ctx.fillRect(0, 0, size, size);
      const pad = Math.round(size * 0.125);
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
    } else {
      ctx.drawImage(img, 0, 0, size, size);
    }
    return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  }
  try {
    let darkSvg = atob('$b64Dark');
    let usedBrandMaster = false;
    if (window.BTBrand && typeof window.BTBrand.masterIconSvg === 'function'){
      const cand = window.BTBrand.masterIconSvg('dark');
      if (cand && cand.indexOf('<svg') >= 0){
        darkSvg = cand;
        usedBrandMaster = true;
      }
    }
    const maskSvg = atob('$b64Mask');
    const imgDark = await loadImg(darkSvg);
    const imgMask = usedBrandMaster ? imgDark : await loadImg(maskSvg);
    const payload = {
      'icon-180.png': renderSize(imgDark, 180, false),
      'icon-192.png': renderSize(imgDark, 192, false),
      'icon-512.png': renderSize(imgDark, 512, false),
      'icon-maskable-512.png': renderSize(imgMask, 512, usedBrandMaster),
      'icon-1024.png': renderSize(imgDark, 1024, false)
    };
    document.getElementById('iconResult').textContent = 'ICON_JSON:' + JSON.stringify(payload);
  } catch (err) {
    document.getElementById('iconResult').textContent = 'ICON_ERR:' + String(err && err.message || err);
  }
})();
</script></body></html>
"@
    [System.IO.File]::WriteAllText($tmpHtml, $htmlContent, (New-Object System.Text.UTF8Encoding($false)))
    $uri = ([System.Uri]$tmpHtml).AbsoluteUri
    $edgeArgs = @(
      '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--disable-extensions', '--disable-breakpad', '--disable-crash-reporter', '--no-crash-upload',
      '--allow-file-access-from-files',
      ("--user-data-dir=" + $tmpProf),
      '--virtual-time-budget=2000', '--dump-dom', $uri
    )
    $proc = Start-Process -FilePath $edgeExe -ArgumentList $edgeArgs -RedirectStandardOutput $tmpOut -RedirectStandardError $tmpErr -PassThru -WindowStyle Hidden
    if (-not $proc.WaitForExit(8000)) {
      try { & taskkill /T /F /PID $proc.Id 2>$null | Out-Null } catch {}
      Start-Sleep -Milliseconds 250
    }
    if (Test-Path -LiteralPath $tmpOut) {
      $fs = New-Object System.IO.FileStream($tmpOut, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
      $dom = ''
      try {
        $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
        $dom = $sr.ReadToEnd()
        $sr.Dispose()
      } finally { $fs.Dispose() }
      if ($dom -match 'ICON_JSON:(\{[^\r\n<]+\})') {
        $jsonText = [System.Net.WebUtility]::HtmlDecode($Matches[1])
        Add-Type -AssemblyName System.Web.Extensions
        $ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
        $ser.MaxJsonLength = 67108864
        $dict = $ser.DeserializeObject($jsonText)
        foreach ($kv in $dict.GetEnumerator()) {
          $bytes = [Convert]::FromBase64String([string]$kv.Value)
          if ($bytes.Length -gt 100) {
            [System.IO.File]::WriteAllBytes((Join-Path $OutDir $kv.Key), $bytes)
          }
        }
        if (Test-Path -LiteralPath (Join-Path $OutDir 'icon-1024.png')) {
          $usedEdge = $true
        }
      }
    }
  } catch {
    $usedEdge = $false
  } finally {
    if (Test-Path -LiteralPath $tmpBase) { Remove-Item -LiteralPath $tmpBase -Recurse -Force -ErrorAction SilentlyContinue }
  }
}

if (-not $usedEdge) {
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-180.png'), 180, 'dark')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-192.png'), 192, 'dark')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-512.png'), 512, 'dark')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-maskable-512.png'), 512, 'maskable')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-1024.png'), 1024, 'dark')
}

if ($IncludeMobile) {
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-ios-light-1024.png'), 1024, 'light')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-ios-dark-1024.png'), 1024, 'dark')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'icon-ios-tinted-1024.png'), 1024, 'tinted')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'ic_launcher_foreground.png'), 432, 'android-fg')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'ic_launcher_background.png'), 432, 'android-bg')
  [BtPrismDropIconRenderer]::RenderPng((Join-Path $OutDir 'ic_launcher_monochrome.png'), 432, 'android-mono')
}

$expected = @(
  @{ Name = 'icon-180.png'; Size = 180 },
  @{ Name = 'icon-192.png'; Size = 192 },
  @{ Name = 'icon-512.png'; Size = 512 },
  @{ Name = 'icon-maskable-512.png'; Size = 512 },
  @{ Name = 'icon-1024.png'; Size = 1024 }
)

$engineName = if ($usedEdge) { 'Headless Edge SVG->Canvas (Refracting Prism Drop)' } else { '.NET System.Drawing GDI+ (Refracting Prism Drop)' }
Write-Host ("Generated BeanTelligence v6.0 Refracting Prism Drop PNG icons in " + $OutDir + " via " + $engineName + ":") -ForegroundColor Cyan

foreach ($item in $expected) {
  $full = Join-Path $OutDir $item.Name
  if (-not (Test-Path -LiteralPath $full)) {
    throw ("Missing generated icon: " + $full)
  }
  $bmp = [System.Drawing.Image]::FromFile($full)
  try {
    if ($bmp.Width -ne $item.Size -or $bmp.Height -ne $item.Size) {
      throw ("Dimension mismatch on " + $item.Name + ": expected " + $item.Size + "x" + $item.Size + ", got " + $bmp.Width + "x" + $bmp.Height)
    }
    $len = (Get-Item -LiteralPath $full).Length
    Write-Host ("  [OK] " + $item.Name + " (" + $bmp.Width + "x" + $bmp.Height + ", " + $len + " bytes)") -ForegroundColor Green
  } finally {
    $bmp.Dispose()
  }
}
