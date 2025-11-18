<p align="center">
	<img width="200" height="200" margin-right="100%" src="./icon.png">
</p>

<p align="center">
    English | <a href="./README_zh.md">中文</a>
</p>


# Overleaf Vertical
🔥Force Overleaf editor and PDF previewer to display top-bottom instead of side-by-side.

👀Highlights:

1. Open-source extension for Overleaf platform
2. Make better use of screen space. Writing papers and researching literature can be done simultaneously.
3. Simple buttons to switch Overleaf layouts
4. Resizable divider - drag to adjust the vertical split ratio
5. Multi-domain support - works with cn.overleaf.com and self-hosted instances
6. Automated builds via GitHub Actions

<p align="center">
  <img src="./images/figure2.png" width="800">
</p>

<p align="center">
  <img src="./images/figure1.png" width="800">
</p>



# Features

## Toggle Vertical/Horizontal Layout
Click the "Split" button in the Overleaf toolbar to toggle between vertical (top-bottom) and horizontal (side-by-side) layouts.

## Resizable Divider
When in vertical mode, you can drag the divider between the editor and PDF preview to adjust the split ratio. Simply click and drag the divider to your preferred position.

## Multi-Domain Support
The extension works with:
- www.overleaf.com (default)
- cn.overleaf.com (Chinese version)
- Self-hosted Overleaf instances

To add custom domains (one at a time):
1. Right-click the extension icon and select "Options"
2. Enter your custom domain pattern in the input field
3. Click "Add Domain" button
4. Repeat steps 2-3 to add more domains
5. Reload your Overleaf page

**Example domain patterns:**
- `*://cn.overleaf.com/*` - Chinese Overleaf
- `*://latex.sysu.edu.cn/*` - Sun Yat-sen University LaTeX
- `*://overleaf.mycompany.com/*` - Company self-hosted instance
- `*://*.overleaf.com/*` - All Overleaf subdomains

## Automated Builds
The extension is automatically built and packaged using GitHub Actions. Download the latest release from the [Releases](https://github.com/liuup/overleaf_vertical/releases) page.

# Installation
Please see [Installation](./Installation.md)


# Best Practice

<div align="center">
  Left: Overleaf | Right: Zetero  
  <br>
  <img src="./images/figure1.png" width="1200">
</div>


<div align="center">
  Left: Overleaf | Right: Website  
  <br>
  <img src="./images/figure3.png" width="1200">
</div>


# License
MIT