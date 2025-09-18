// 遊戲狀態管理
let gameState = {
    homeTeam: {
        name: '主隊',
        score: 0,
        hasServe: true,
        players: {
            1: '1',
            2: '2', 
            3: '3',
            4: '4',
            5: '5',
            6: '6'
        },
        libero: '7'
    },
    awayTeam: {
        name: '客隊',
        score: 0,
        hasServe: false,
        players: {
            1: '11',
            2: '12', 
            3: '13',
            4: '14',
            5: '15',
            6: '16'
        },
        libero: '17'
    },
    rotationLog: []
};

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    updateDisplay();
    
    // 綁定開始遊戲按鈕
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // 載入保存的設定
    loadSetupFromStorage();
});

// 載入設定頁面的保存資料
function loadSetupFromStorage() {
    const savedState = localStorage.getItem('volleyballGameState');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        // 載入隊伍名稱
        document.getElementById('home-team-name').value = state.homeTeam.name;
        document.getElementById('away-team-name').value = state.awayTeam.name;
        
        // 載入主隊球員位置
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`home-pos-${i}`);
            if (input && state.homeTeam.players[i]) {
                input.value = state.homeTeam.players[i];
            }
        }
        
        // 載入主隊自由球員
        const homeLiberoInput = document.getElementById('home-libero');
        if (homeLiberoInput && state.homeTeam.libero) {
            homeLiberoInput.value = state.homeTeam.libero;
        }
        
        // 載入客隊球員位置
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`away-pos-${i}`);
            if (input && state.awayTeam.players[i]) {
                input.value = state.awayTeam.players[i];
            }
        }
        
        // 載入客隊自由球員
        const awayLiberoInput = document.getElementById('away-libero');
        if (awayLiberoInput && state.awayTeam.libero) {
            awayLiberoInput.value = state.awayTeam.libero;
        }
        
        // 載入初始發球權
        const serveRadio = state.homeTeam.hasServe ? 'home' : 'away';
        document.querySelector(`input[name="initial-serve"][value="${serveRadio}"]`).checked = true;
    }
}

// 開始遊戲
function startGame() {
    // 獲取隊伍名稱
    gameState.homeTeam.name = document.getElementById('home-team-name').value || '主隊';
    gameState.awayTeam.name = document.getElementById('away-team-name').value || '客隊';
    
    // 獲取主隊球員背號
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`home-pos-${i}`);
        gameState.homeTeam.players[i] = input.value || `${i}`;
    }
    gameState.homeTeam.libero = document.getElementById('home-libero').value || '7';
    
    // 獲取客隊球員背號
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`away-pos-${i}`);
        gameState.awayTeam.players[i] = input.value || `${i+10}`;
    }
    gameState.awayTeam.libero = document.getElementById('away-libero').value || '17';
    
    // 獲取初始發球權
    const initialServe = document.querySelector('input[name="initial-serve"]:checked').value;
    gameState.homeTeam.hasServe = (initialServe === 'home');
    gameState.awayTeam.hasServe = (initialServe === 'away');
    
    // 重置比分和記錄
    gameState.homeTeam.score = 0;
    gameState.awayTeam.score = 0;
    gameState.rotationLog = [`比賽開始 - ${gameState.homeTeam.hasServe ? gameState.homeTeam.name : gameState.awayTeam.name}發球`];
    
    // 切換到遊戲頁面
    showGamePage();
    
    // 更新顯示
    updateDisplay();
    
    // 保存狀態
    saveGameState();
}

// 顯示遊戲頁面
function showGamePage() {
    document.getElementById('setup-page').classList.remove('active');
    document.getElementById('game-page').classList.add('active');
}

// 顯示設定頁面
function showSetup() {
    document.getElementById('game-page').classList.remove('active');
    document.getElementById('setup-page').classList.add('active');
    loadSetupFromStorage();
}

// 加分功能
function addScore(team) {
    const wasHomeServing = gameState.homeTeam.hasServe;
    const wasAwayServing = gameState.awayTeam.hasServe;
    
    // 加分
    gameState[team + 'Team'].score++;
    
    // 判斷是否需要輪轉和切換發球權
    if (team === 'home') {
        // 主隊得分
        if (wasAwayServing) {
            // 主隊從客隊手中奪回發球權，主隊需要輪轉
            rotateHomeTeamClockwise();
            gameState.homeTeam.hasServe = true;
            gameState.awayTeam.hasServe = false;
            addToLog(`${gameState.homeTeam.name}得分並奪回發球權，進行輪轉 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        } else {
            // 主隊連續得分，不輪轉
            addToLog(`${gameState.homeTeam.name}連續得分 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        }
    } else {
        // 客隊得分
        if (wasHomeServing) {
            // 客隊從主隊手中奪回發球權，客隊需要輪轉
            rotateAwayTeamClockwise();
            gameState.homeTeam.hasServe = false;
            gameState.awayTeam.hasServe = true;
            addToLog(`${gameState.awayTeam.name}得分並奪回發球權，進行輪轉 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        } else {
            // 客隊連續得分，不輪轉
            addToLog(`${gameState.awayTeam.name}連續得分 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        }
    }
    
    updateDisplay();
    saveGameState();
}

// 減分功能
function subtractScore(team) {
    if (gameState[team + 'Team'].score > 0) {
        gameState[team + 'Team'].score--;
        addToLog(`${gameState[team + 'Team'].name}分數修正 -1 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        updateDisplay();
        saveGameState();
    }
}

// 順時針輪轉主隊 (1→6→5→4→3→2→1)
function rotateHomeTeamClockwise() {
    const temp = gameState.homeTeam.players[1];
    gameState.homeTeam.players[1] = gameState.homeTeam.players[2];
    gameState.homeTeam.players[2] = gameState.homeTeam.players[3];
    gameState.homeTeam.players[3] = gameState.homeTeam.players[4];
    gameState.homeTeam.players[4] = gameState.homeTeam.players[5];
    gameState.homeTeam.players[5] = gameState.homeTeam.players[6];
    gameState.homeTeam.players[6] = temp;
}

// 順時針輪轉客隊 (1→6→5→4→3→2→1)
function rotateAwayTeamClockwise() {
    const temp = gameState.awayTeam.players[1];
    gameState.awayTeam.players[1] = gameState.awayTeam.players[2];
    gameState.awayTeam.players[2] = gameState.awayTeam.players[3];
    gameState.awayTeam.players[3] = gameState.awayTeam.players[4];
    gameState.awayTeam.players[4] = gameState.awayTeam.players[5];
    gameState.awayTeam.players[5] = gameState.awayTeam.players[6];
    gameState.awayTeam.players[6] = temp;
}

// 手動輪轉主隊
function manualRotateHome() {
    rotateHomeTeamClockwise();
    addToLog(`${gameState.homeTeam.name}手動輪轉`);
    updateDisplay();
    saveGameState();
}

// 手動輪轉客隊
function manualRotateAway() {
    rotateAwayTeamClockwise();
    addToLog(`${gameState.awayTeam.name}手動輪轉`);
    updateDisplay();
    saveGameState();
}

// 重置比分
function resetScore() {
    if (confirm('確定要重置比分嗎？')) {
        gameState.homeTeam.score = 0;
        gameState.awayTeam.score = 0;
        addToLog('比分重置');
        updateDisplay();
        saveGameState();
    }
}

// 更新顯示
function updateDisplay() {
    // 更新隊伍名稱
    document.getElementById('home-name').textContent = gameState.homeTeam.name;
    document.getElementById('away-name').textContent = gameState.awayTeam.name;
    
    // 更新比分
    document.getElementById('home-score').textContent = gameState.homeTeam.score;
    document.getElementById('away-score').textContent = gameState.awayTeam.score;
    
    // 更新發球指示器
    const homeServeIndicator = document.getElementById('home-serve');
    const awayServeIndicator = document.getElementById('away-serve');
    
    if (gameState.homeTeam.hasServe) {
        homeServeIndicator.classList.remove('hidden');
        awayServeIndicator.classList.add('hidden');
    } else {
        homeServeIndicator.classList.add('hidden');
        awayServeIndicator.classList.remove('hidden');
    }
    
    // 更新場地名稱
    document.getElementById('home-court-name').textContent = gameState.homeTeam.name;
    document.getElementById('away-court-name').textContent = gameState.awayTeam.name;
    
    // 更新主隊球員位置（裁判視角）
    document.getElementById('home-pos-1-display').textContent = `#${gameState.homeTeam.players[1]}`;
    document.getElementById('home-pos-2-display').textContent = `#${gameState.homeTeam.players[2]}`;
    document.getElementById('home-pos-3-display').textContent = `#${gameState.homeTeam.players[3]}`;
    document.getElementById('home-pos-4-display').textContent = `#${gameState.homeTeam.players[4]}`;
    document.getElementById('home-pos-5-display').textContent = `#${gameState.homeTeam.players[5]}`;
    document.getElementById('home-pos-6-display').textContent = `#${gameState.homeTeam.players[6]}`;
    
    // 更新客隊球員位置（裁判視角）
    document.getElementById('away-pos-1-display').textContent = `#${gameState.awayTeam.players[1]}`;
    document.getElementById('away-pos-2-display').textContent = `#${gameState.awayTeam.players[2]}`;
    document.getElementById('away-pos-3-display').textContent = `#${gameState.awayTeam.players[3]}`;
    document.getElementById('away-pos-4-display').textContent = `#${gameState.awayTeam.players[4]}`;
    document.getElementById('away-pos-5-display').textContent = `#${gameState.awayTeam.players[5]}`;
    document.getElementById('away-pos-6-display').textContent = `#${gameState.awayTeam.players[6]}`;
    
    // 更新輪轉記錄
    updateRotationLog();
}

// 更新輪轉記錄
function updateRotationLog() {
    const logContent = document.getElementById('log-content');
    if (logContent) {
        logContent.innerHTML = gameState.rotationLog.slice(-10).reverse().join('<br>');
    }
}

// 添加記錄
function addToLog(message) {
    const timestamp = new Date().toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    gameState.rotationLog.push(`[${timestamp}] ${message}`);
}

// 保存遊戲狀態
function saveGameState() {
    localStorage.setItem('volleyballGameState', JSON.stringify(gameState));
}

// 載入遊戲狀態
function loadGameState() {
    const savedState = localStorage.getItem('volleyballGameState');
    if (savedState) {
        gameState = { ...gameState, ...JSON.parse(savedState) };
    }
}

// 鍵盤快捷鍵
document.addEventListener('keydown', function(event) {
    if (document.getElementById('game-page').classList.contains('active')) {
        switch(event.key) {
            case '1':
                addScore('home');
                break;
            case '2':
                addScore('away');
                break;
            case 'h':
            case 'H':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    manualRotateHome();
                }
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    manualRotateAway();
                }
                break;
            case 'Escape':
                showSetup();
                break;
        }
    }
});

// 觸控支援
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
            // 向上滑動
            console.log('向上滑動');
        } else {
            // 向下滑動
            console.log('向下滑動');
        }
    }
}

// 自動保存功能
setInterval(saveGameState, 30000); // 每30秒自動保存一次

// PWA 支援（基本）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker 註冊成功');
            })
            .catch(function(error) {
                console.log('ServiceWorker 註冊失敗');
            });
    });
}

// 匯出/匯入功能
function exportGameData() {
    const data = JSON.stringify(gameState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `volleyball_game_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importGameData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                gameState = { ...gameState, ...importedData };
                updateDisplay();
                saveGameState();
                alert('資料匯入成功！');
            } catch (error) {
                alert('匯入失敗：檔案格式錯誤');
            }
        };
        reader.readAsText(file);
    }
}

// 列印功能
function printGameState() {
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>排球比賽記錄</h1>
            <h2>比分：${gameState.homeTeam.name} ${gameState.homeTeam.score} : ${gameState.awayTeam.score} ${gameState.awayTeam.name}</h2>
            <h3>目前發球：${gameState.homeTeam.hasServe ? gameState.homeTeam.name : gameState.awayTeam.name}</h3>
            
            <h3>主隊球員位置：</h3>
            <table border="1" style="border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; text-align: center;">4號位<br>#${gameState.homeTeam.players[4]}</td>
                    <td style="padding: 10px; text-align: center;">3號位<br>#${gameState.homeTeam.players[3]}</td>
                    <td style="padding: 10px; text-align: center;">2號位<br>#${gameState.homeTeam.players[2]}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; text-align: center;">5號位<br>#${gameState.homeTeam.players[5]}</td>
                    <td style="padding: 10px; text-align: center;">6號位<br>#${gameState.homeTeam.players[6]}</td>
                    <td style="padding: 10px; text-align: center;">1號位<br>#${gameState.homeTeam.players[1]}</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 10px; text-align: center; border-top: 2px dashed #999;">自由球員<br>#${gameState.homeTeam.libero}</td>
                </tr>
            </table>
            
            <h3>客隊球員位置：</h3>
            <table border="1" style="border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; text-align: center;">4號位<br>#${gameState.awayTeam.players[4]}</td>
                    <td style="padding: 10px; text-align: center;">3號位<br>#${gameState.awayTeam.players[3]}</td>
                    <td style="padding: 10px; text-align: center;">2號位<br>#${gameState.awayTeam.players[2]}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; text-align: center;">5號位<br>#${gameState.awayTeam.players[5]}</td>
                    <td style="padding: 10px; text-align: center;">6號位<br>#${gameState.awayTeam.players[6]}</td>
                    <td style="padding: 10px; text-align: center;">1號位<br>#${gameState.awayTeam.players[1]}</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 10px; text-align: center; border-top: 2px dashed #999;">自由球員<br>#${gameState.awayTeam.libero}</td>
                </tr>
            </table>
            
            <h3>比賽記錄：</h3>
            <div>${gameState.rotationLog.join('<br>')}</div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}
