# PWA 圖標創建指南

## 需要的圖標尺寸

為了讓PWA正常工作，你需要創建以下尺寸的圖標：

### 必需的圖標
- `icon-16x16.png` - 瀏覽器收藏夾圖標
- `icon-32x32.png` - 瀏覽器收藏夾圖標
- `icon-72x72.png` - Android Chrome
- `icon-96x96.png` - Android Chrome
- `icon-128x128.png` - Android Chrome
- `icon-144x144.png` - Microsoft Tiles
- `icon-152x152.png` - iOS Safari
- `icon-192x192.png` - Android Chrome (推薦)
- `icon-384x384.png` - Android Chrome
- `icon-512x512.png` - Android Chrome (推薦)

### 可選的圖標
- `icon-57x57.png` - iOS Safari (舊版)
- `icon-60x60.png` - iOS Safari
- `icon-76x76.png` - iOS Safari (iPad)
- `icon-114x114.png` - iOS Safari (舊版 Retina)
- `icon-120x120.png` - iOS Safari
- `icon-180x180.png` - iOS Safari (新版)

## 創建方法

### 方法1：線上工具
1. 訪問 [RealFaviconGenerator](https://realfavicongenerator.net/)
2. 上傳一張 512x512 的原始圖片
3. 下載生成的圖標包
4. 將所有圖標放到 `icons/` 資料夾

### 方法2：使用設計軟體
1. 創建一個 512x512 的排球主題圖標
2. 使用 Photoshop、GIMP 或 Figma 調整到各種尺寸
3. 保存為 PNG 格式

### 方法3：簡單文字圖標
如果暫時沒有圖標，可以創建簡單的文字圖標：

```html
<!-- 在 HTML head 中暫時使用 -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏐</text></svg>">
```

## 資料夾結構

創建以下資料夾結構：

```
volleyball/
├── icons/
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── index.html
├── manifest.json
├── sw.js
└── ...
```

## 設計建議

1. **簡潔明瞭**：圖標應該在小尺寸下也能清楚識別
2. **排球主題**：可以使用排球、球網、或計分板的圖案
3. **品牌色彩**：使用與應用程式一致的顏色 (#667eea, #764ba2)
4. **高對比度**：確保在不同背景下都能看清楚

## 測試

創建圖標後，可以：
1. 在瀏覽器中測試 manifest.json
2. 使用 Chrome DevTools 的 Application 標籤檢查
3. 在手機上測試安裝功能

## 臨時解決方案

如果暫時沒有圖標，可以先移除 HTML 中的圖標連結，PWA 仍然可以正常工作，只是沒有自定義圖標。
