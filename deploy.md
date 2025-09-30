# GitHub Pages 部署指南

## 快速部署步驟

### 1. 建立 GitHub 儲存庫
```bash
git init
git add .
git commit -m "Initial commit: 排球輪轉計分系統"
git branch -M main
git remote add origin https://github.com/你的用戶名/volleyball.git
git push -u origin main
```

### 2. 啟用 GitHub Pages
1. 進入你的 GitHub 儲存庫頁面
2. 點擊 **Settings** 標籤
3. 在左側選單中找到 **Pages**
4. 在 **Source** 區域選擇 "Deploy from a branch"
5. 選擇 **Branch**: `main` 和 **Folder**: `/ (root)`
6. 點擊 **Save**

### 3. 等待部署完成
- 通常需要 1-5 分鐘
- 部署完成後會顯示網址：`https://你的用戶名.github.io/volleyball`
- 可在 **Actions** 標籤查看部署狀態

### 4. 自訂網域（選用）
如果你有自己的網域：
1. 在 **Pages** 設定中的 **Custom domain** 輸入你的網域
2. 修改 `CNAME` 檔案，將註解取消並填入你的網域
3. 在你的網域 DNS 設定中新增 CNAME 記錄指向 `你的用戶名.github.io`

## 更新應用程式

當你修改程式碼後：
```bash
git add .
git commit -m "更新功能描述"
git push
```

GitHub Pages 會自動重新部署。

## 故障排除

### 網頁顯示 404
- 檢查儲存庫名稱是否正確
- 確認 `index.html` 在根目錄
- 等待幾分鐘讓部署完成

### 樣式或 JavaScript 無法載入
- 檢查檔案路徑是否正確
- 確認所有檔案都已推送到 GitHub
- 清除瀏覽器快取

### 自訂網域無法存取
- 檢查 DNS 設定
- 確認 `CNAME` 檔案格式正確
- 等待 DNS 傳播（可能需要 24 小時）

## 本機測試

如果想在本機測試：
```bash
# 安裝 Jekyll (需要 Ruby)
gem install jekyll bundler

# 在專案目錄執行
jekyll serve

# 開啟 http://localhost:4000
```

或直接用瀏覽器開啟 `index.html` 檔案進行基本測試。


