// 遊戲狀態管理
let gameState = {
    homeTeam: {
        name: '左側',
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
        libero: '7',
        liberoPositions: [] // 記錄自由球員替換的位置
    },
    awayTeam: {
        name: '右側',
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
        libero: '17',
        liberoPositions: [] // 記錄自由球員替換的位置
    },
    rotationLog: [],
    substitutions: {
        home: {
            count: 0,
            history: []
        },
        away: {
            count: 0,
            history: []
        }
    },
    actionHistory: [] // 操作歷史記錄
};

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    updateDisplay();
    
    // 綁定開始遊戲按鈕
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // 綁定初始化按鈕
    document.getElementById('reset-setup').addEventListener('click', resetSetup);

    // 綁定設定頁輪轉與互換按鈕
    document.getElementById('setup-rotate-home').addEventListener('click', setupRotateHome);
    document.getElementById('setup-rotate-away').addEventListener('click', setupRotateAway);
    document.getElementById('setup-swap-teams').addEventListener('click', setupSwapTeams);

    // 明暗主題切換
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // 載入保存的設定
    loadSetupFromStorage();
});

// 初始化設定（清除所有輸入）
function resetSetup() {
    if (confirm('確定要清除所有設定嗎？')) {
        try {
            // 清除隊伍名稱
            const homeTeamInput = document.getElementById('home-team-name');
            const awayTeamInput = document.getElementById('away-team-name');
            if (homeTeamInput) homeTeamInput.value = '';
            if (awayTeamInput) awayTeamInput.value = '';
            
            // 清除左側球員背號
            for (let i = 1; i <= 6; i++) {
                const input = document.getElementById(`home-pos-${i}`);
                if (input) {
                    input.value = '';
                }
            }
            
            // 清除左側自由球員
            const homeLiberoInput = document.getElementById('home-libero');
            if (homeLiberoInput) {
                homeLiberoInput.value = '';
            }
            
            // 清除右側球員背號
            for (let i = 1; i <= 6; i++) {
                const input = document.getElementById(`away-pos-${i}`);
                if (input) {
                    input.value = '';
                }
            }
            
            // 清除右側自由球員
            const awayLiberoInput = document.getElementById('away-libero');
            if (awayLiberoInput) {
                awayLiberoInput.value = '';
            }
            
            // 重置發球權選擇為左側
            const homeServeRadio = document.querySelector('input[name="initial-serve"][value="home"]');
            if (homeServeRadio) {
                homeServeRadio.checked = true;
            }
            
            // 重置替換記錄
            gameState.substitutions = {
                home: {
                    count: 0,
                    history: []
                },
                away: {
                    count: 0,
                    history: []
                }
            };
            
            // 清除localStorage中的保存資料
            localStorage.removeItem('volleyballGameState');
            
            alert('設定已清除！');
        } catch (error) {
            console.error('重置設定時發生錯誤:', error);
            alert('重置設定時發生錯誤，請重新整理頁面後再試。');
        }
    }
}

// 設定頁：左側球隊順時針輪轉（更新輸入欄位）
function setupRotateHome() {
    const ids = [1, 2, 3, 4, 5, 6].map(p => document.getElementById(`home-pos-${p}`));
    const temp = ids[0].value;
    ids[0].value = ids[1].value;
    ids[1].value = ids[2].value;
    ids[2].value = ids[3].value;
    ids[3].value = ids[4].value;
    ids[4].value = ids[5].value;
    ids[5].value = temp;
}

// 設定頁：右側球隊順時針輪轉（更新輸入欄位）
function setupRotateAway() {
    const ids = [1, 2, 3, 4, 5, 6].map(p => document.getElementById(`away-pos-${p}`));
    const temp = ids[0].value;
    ids[0].value = ids[1].value;
    ids[1].value = ids[2].value;
    ids[2].value = ids[3].value;
    ids[3].value = ids[4].value;
    ids[4].value = ids[5].value;
    ids[5].value = temp;
}

// 設定頁：左右球隊互換（交換所有輸入欄位與發球權）
function setupSwapTeams() {
    // 互換隊名
    const homeName = document.getElementById('home-team-name');
    const awayName = document.getElementById('away-team-name');
    const tempName = homeName.value;
    homeName.value = awayName.value;
    awayName.value = tempName;

    // 互換 1~6 號位背號
    for (let p = 1; p <= 6; p++) {
        const homeInput = document.getElementById(`home-pos-${p}`);
        const awayInput = document.getElementById(`away-pos-${p}`);
        const tempVal = homeInput.value;
        homeInput.value = awayInput.value;
        awayInput.value = tempVal;
    }

    // 互換自由球員
    const homeLibero = document.getElementById('home-libero');
    const awayLibero = document.getElementById('away-libero');
    const tempLibero = homeLibero.value;
    homeLibero.value = awayLibero.value;
    awayLibero.value = tempLibero;

    // 互換發球權選擇
    const serveRadios = document.querySelectorAll('input[name="initial-serve"]');
    serveRadios.forEach(radio => {
        if (radio.checked) {
            radio.checked = false;
            const opposite = document.querySelector(`input[name="initial-serve"][value="${radio.value === 'home' ? 'away' : 'home'}"]`);
            if (opposite) opposite.checked = true;
        }
    });
}

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
    gameState.homeTeam.name = document.getElementById('home-team-name').value || '左側';
    gameState.awayTeam.name = document.getElementById('away-team-name').value || '右側';
    
    // 獲取主隊球員背號
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`home-pos-${i}`);
        gameState.homeTeam.players[i] = input.value || `${i}`;
    }
    gameState.homeTeam.libero = document.getElementById('home-libero').value || '7';
    gameState.homeTeam.liberoPositions = []; // 重置自由球員位置
    
    // 獲取客隊球員背號
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`away-pos-${i}`);
        gameState.awayTeam.players[i] = input.value || `${i+10}`;
    }
    gameState.awayTeam.libero = document.getElementById('away-libero').value || '17';
    gameState.awayTeam.liberoPositions = []; // 重置自由球員位置
    
    // 獲取初始發球權
    const initialServe = document.querySelector('input[name="initial-serve"]:checked').value;
    gameState.homeTeam.hasServe = (initialServe === 'home');
    gameState.awayTeam.hasServe = (initialServe === 'away');
    
    // 重置比分和記錄
    gameState.homeTeam.score = 0;
    gameState.awayTeam.score = 0;
    gameState.rotationLog = [`比賽開始 - ${gameState.homeTeam.hasServe ? gameState.homeTeam.name : gameState.awayTeam.name}發球`];
    gameState.actionHistory = []; // 清空操作歷史
    
    // 重置替換記錄
    gameState.substitutions = {
        home: {
            count: 0,
            history: []
        },
        away: {
            count: 0,
            history: []
        }
    };
    
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

// 保存操作到歷史記錄
function saveActionToHistory(action) {
    // 限制歷史記錄數量（最多保留10個操作）
    if (gameState.actionHistory.length >= 10) {
        gameState.actionHistory.shift();
    }
    
    gameState.actionHistory.push({
        ...action,
        timestamp: Date.now()
    });
    
    updateUndoButton();
}

// 更新回溯按鈕狀態
function updateUndoButton() {
    const undoButton = document.querySelector('.btn-undo');
    if (undoButton) {
        if (gameState.actionHistory.length === 0) {
            undoButton.disabled = true;
            undoButton.textContent = '⟲ 回溯操作 (無操作)';
        } else {
            undoButton.disabled = false;
            const lastAction = gameState.actionHistory[gameState.actionHistory.length - 1];
            let actionText = '';
            
            if (lastAction.type === 'score') {
                actionText = `撤銷${gameState[lastAction.team + 'Team'].name}得分`;
            } else if (lastAction.type === 'rotation') {
                actionText = `撤銷${lastAction.team === 'home' ? gameState.homeTeam.name : gameState.awayTeam.name}輪轉`;
            } else if (lastAction.type === 'substitution') {
                actionText = `撤銷${gameState[lastAction.team + 'Team'].name}替換`;
            } else if (lastAction.type === 'swap') {
                actionText = `撤銷左右交換`;
            }
            
            undoButton.textContent = `⟲ 回溯操作 (${actionText})`;
        }
    }
}

// 加分功能
function addScore(team) {
    // 保存當前狀態到歷史記錄
    const beforeState = {
        type: 'score',
        team: team,
        homeScore: gameState.homeTeam.score,
        awayScore: gameState.awayTeam.score,
        homeServe: gameState.homeTeam.hasServe,
        awayServe: gameState.awayTeam.hasServe,
        homePlayers: { ...gameState.homeTeam.players },
        awayPlayers: { ...gameState.awayTeam.players },
        homeLiberoPositions: [...gameState.homeTeam.liberoPositions],
        awayLiberoPositions: [...gameState.awayTeam.liberoPositions]
    };
    
    const wasHomeServing = gameState.homeTeam.hasServe;
    const wasAwayServing = gameState.awayTeam.hasServe;
    
    // 加分
    gameState[team + 'Team'].score++;
    
    let rotated = false;
    
    // 判斷是否需要輪轉和切換發球權
    if (team === 'home') {
        // 左側得分
        if (wasAwayServing) {
            // 左側從右側手中奪回發球權，左側需要輪轉
            rotateHomeTeamClockwise();
            rotated = true;
            gameState.homeTeam.hasServe = true;
            gameState.awayTeam.hasServe = false;
            addToLog(`${gameState.homeTeam.name}得分並奪回發球權，進行輪轉 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        } else {
            // 左側連續得分，不輪轉
            addToLog(`${gameState.homeTeam.name}連續得分 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        }
    } else {
        // 右側得分
        if (wasHomeServing) {
            // 右側從左側手中奪回發球權，右側需要輪轉
            rotateAwayTeamClockwise();
            rotated = true;
            gameState.homeTeam.hasServe = false;
            gameState.awayTeam.hasServe = true;
            addToLog(`${gameState.awayTeam.name}得分並奪回發球權，進行輪轉 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        } else {
            // 右側連續得分，不輪轉
            addToLog(`${gameState.awayTeam.name}連續得分 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
        }
    }
    
    // 記錄操作（包含是否輪轉的資訊）
    beforeState.rotated = rotated;
    saveActionToHistory(beforeState);
    
    updateDisplay();
    saveGameState();
}

// 回溯操作功能
function undoLastAction() {
    if (gameState.actionHistory.length === 0) {
        alert('沒有可回溯的操作');
        return;
    }
    
    const lastAction = gameState.actionHistory.pop();
    
    if (lastAction.type === 'score') {
        // 恢復比分
        gameState.homeTeam.score = lastAction.homeScore;
        gameState.awayTeam.score = lastAction.awayScore;
        
        // 恢復發球權
        gameState.homeTeam.hasServe = lastAction.homeServe;
        gameState.awayTeam.hasServe = lastAction.awayServe;
        
        // 如果有輪轉，恢復球員位置
        if (lastAction.rotated) {
            gameState.homeTeam.players = { ...lastAction.homePlayers };
            gameState.awayTeam.players = { ...lastAction.awayPlayers };
        }
        
        // 恢復自由球員位置
        if (lastAction.homeLiberoPositions) {
            gameState.homeTeam.liberoPositions = [...lastAction.homeLiberoPositions];
        }
        if (lastAction.awayLiberoPositions) {
            gameState.awayTeam.liberoPositions = [...lastAction.awayLiberoPositions];
        }
        
        addToLog(`回溯操作：${gameState[lastAction.team + 'Team'].name}得分已撤銷 (${gameState.homeTeam.score}:${gameState.awayTeam.score})`);
    } else if (lastAction.type === 'rotation') {
        // 恢復輪轉
        gameState.homeTeam.players = { ...lastAction.homePlayers };
        gameState.awayTeam.players = { ...lastAction.awayPlayers };
        
        // 恢復自由球員位置
        if (lastAction.homeLiberoPositions) {
            gameState.homeTeam.liberoPositions = [...lastAction.homeLiberoPositions];
        }
        if (lastAction.awayLiberoPositions) {
            gameState.awayTeam.liberoPositions = [...lastAction.awayLiberoPositions];
        }
        
        addToLog(`回溯操作：${lastAction.team === 'home' ? gameState.homeTeam.name : gameState.awayTeam.name}輪轉已撤銷`);
    } else if (lastAction.type === 'substitution') {
        // 恢復替換
        gameState[lastAction.team + 'Team'].players[lastAction.position] = lastAction.playerOut;
        gameState.substitutions[lastAction.team].count = lastAction.subCount;
        gameState.substitutions[lastAction.team].history = [...lastAction.subHistory];
        
        addToLog(`回溯操作：${gameState[lastAction.team + 'Team'].name}替換已撤銷`);
    } else if (lastAction.type === 'swap') {
        // 恢復交換
        gameState.homeTeam = JSON.parse(JSON.stringify(lastAction.homeTeam));
        gameState.awayTeam = JSON.parse(JSON.stringify(lastAction.awayTeam));
        gameState.substitutions = JSON.parse(JSON.stringify(lastAction.substitutions));
        
        addToLog(`回溯操作：左右交換已撤銷 (${gameState.homeTeam.name} ${gameState.homeTeam.score}:${gameState.awayTeam.score} ${gameState.awayTeam.name})`);
    }
    
    updateDisplay();
    updateUndoButton();
    updateUndoButtonInModal();
    saveGameState();
}

// 順時針輪轉左側 (1→6→5→4→3→2→1)
function rotateHomeTeamClockwise() {
    const temp = gameState.homeTeam.players[1];
    gameState.homeTeam.players[1] = gameState.homeTeam.players[2];
    gameState.homeTeam.players[2] = gameState.homeTeam.players[3];
    gameState.homeTeam.players[3] = gameState.homeTeam.players[4];
    gameState.homeTeam.players[4] = gameState.homeTeam.players[5];
    gameState.homeTeam.players[5] = gameState.homeTeam.players[6];
    gameState.homeTeam.players[6] = temp;
    
    // 同時輪轉自由球員位置
    const newLiberoPositions = [];
    gameState.homeTeam.liberoPositions.forEach(pos => {
        // 位置輪轉對應: 1→6, 2→1, 3→2, 4→3, 5→4, 6→5
        const rotationMap = {1: 6, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5};
        newLiberoPositions.push(rotationMap[pos]);
    });
    gameState.homeTeam.liberoPositions = newLiberoPositions;
}

// 順時針輪轉右側 (1→6→5→4→3→2→1)
function rotateAwayTeamClockwise() {
    const temp = gameState.awayTeam.players[1];
    gameState.awayTeam.players[1] = gameState.awayTeam.players[2];
    gameState.awayTeam.players[2] = gameState.awayTeam.players[3];
    gameState.awayTeam.players[3] = gameState.awayTeam.players[4];
    gameState.awayTeam.players[4] = gameState.awayTeam.players[5];
    gameState.awayTeam.players[5] = gameState.awayTeam.players[6];
    gameState.awayTeam.players[6] = temp;
    
    // 同時輪轉自由球員位置
    const newLiberoPositions = [];
    gameState.awayTeam.liberoPositions.forEach(pos => {
        // 位置輪轉對應: 1→6, 2→1, 3→2, 4→3, 5→4, 6→5
        const rotationMap = {1: 6, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5};
        newLiberoPositions.push(rotationMap[pos]);
    });
    gameState.awayTeam.liberoPositions = newLiberoPositions;
}

// 手動輪轉左側
function manualRotateHome() {
    // 保存當前狀態到歷史記錄
    const beforeState = {
        type: 'rotation',
        team: 'home',
        homePlayers: { ...gameState.homeTeam.players },
        awayPlayers: { ...gameState.awayTeam.players },
        homeLiberoPositions: [...gameState.homeTeam.liberoPositions],
        awayLiberoPositions: [...gameState.awayTeam.liberoPositions]
    };
    
    rotateHomeTeamClockwise();
    addToLog(`${gameState.homeTeam.name}手動輪轉`);
    
    saveActionToHistory(beforeState);
    updateDisplay();
    updateUndoButtonInModal();
    saveGameState();
}

// 手動輪轉右側
function manualRotateAway() {
    // 保存當前狀態到歷史記錄
    const beforeState = {
        type: 'rotation',
        team: 'away',
        homePlayers: { ...gameState.homeTeam.players },
        awayPlayers: { ...gameState.awayTeam.players },
        homeLiberoPositions: [...gameState.homeTeam.liberoPositions],
        awayLiberoPositions: [...gameState.awayTeam.liberoPositions]
    };
    
    rotateAwayTeamClockwise();
    addToLog(`${gameState.awayTeam.name}手動輪轉`);
    
    saveActionToHistory(beforeState);
    updateDisplay();
    updateUndoButtonInModal();
    saveGameState();
}

// 重置比分
function resetScore() {
    if (confirm('確定要重置比分嗎？這將清除比分、替換記錄和操作歷史。')) {
        gameState.homeTeam.score = 0;
        gameState.awayTeam.score = 0;
        gameState.actionHistory = []; // 清空操作歷史
        
        // 重置替換記錄
        gameState.substitutions = {
            home: {
                count: 0,
                history: []
            },
            away: {
                count: 0,
                history: []
            }
        };
        
        addToLog('比分重置，替換記錄清除');
        updateDisplay();
        updateUndoButton();
        updateUndoButtonInModal();
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
    updatePlayerDisplay('home', 1);
    updatePlayerDisplay('home', 2);
    updatePlayerDisplay('home', 3);
    updatePlayerDisplay('home', 4);
    updatePlayerDisplay('home', 5);
    updatePlayerDisplay('home', 6);
    
    // 更新客隊球員位置（裁判視角）
    updatePlayerDisplay('away', 1);
    updatePlayerDisplay('away', 2);
    updatePlayerDisplay('away', 3);
    updatePlayerDisplay('away', 4);
    updatePlayerDisplay('away', 5);
    updatePlayerDisplay('away', 6);
    
    // 更新輪轉記錄
    updateRotationLog();
    
    // 更新回溯按鈕狀態
    updateUndoButton();
}

// 更新單個球員位置的顯示
function updatePlayerDisplay(team, position) {
    const element = document.getElementById(`${team}-pos-${position}-display`);
    if (!element) return; // 防止元素不存在
    
    const teamData = gameState[team + 'Team'];
    if (!teamData) return; // 防止資料不存在
    
    // 確保 liberoPositions 存在
    if (!teamData.liberoPositions) {
        teamData.liberoPositions = [];
    }
    
    const isLibero = teamData.liberoPositions.includes(position);
    
    if (isLibero) {
        element.textContent = `#${teamData.libero}`;
        element.classList.add('libero-active');
    } else {
        element.textContent = `#${teamData.players[position]}`;
        element.classList.remove('libero-active');
    }
}

// 切換自由球員
function toggleLibero(team, position) {
    const teamData = gameState[team + 'Team'];
    if (!teamData) return;
    
    // 確保 liberoPositions 存在
    if (!teamData.liberoPositions) {
        teamData.liberoPositions = [];
    }
    
    const index = teamData.liberoPositions.indexOf(position);
    
    if (index > -1) {
        // 如果該位置已經是自由球員，切換回原球員
        teamData.liberoPositions.splice(index, 1);
        addToLog(`${teamData.name} ${position}號位：#${teamData.libero} 換回 #${teamData.players[position]}`);
    } else {
        // 切換為自由球員
        teamData.liberoPositions.push(position);
        addToLog(`${teamData.name} ${position}號位：#${teamData.players[position]} 換成自由球員 #${teamData.libero}`);
    }
    
    updateDisplay();
    saveGameState();
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
        const loaded = JSON.parse(savedState);
        gameState = { ...gameState, ...loaded };
        
        // 確保 liberoPositions 存在（向後兼容舊版本）
        if (!gameState.homeTeam.liberoPositions) {
            gameState.homeTeam.liberoPositions = [];
        }
        if (!gameState.awayTeam.liberoPositions) {
            gameState.awayTeam.liberoPositions = [];
        }
    }
}

// 鍵盤快捷鍵已取消
// document.addEventListener('keydown', function(event) {
//     // 檢查是否在輸入框或選擇框中，如果是則不處理快捷鍵
//     const isInputField = event.target.tagName === 'INPUT' || 
//                         event.target.tagName === 'TEXTAREA' || 
//                         event.target.tagName === 'SELECT';
//     
//     if (document.getElementById('game-page').classList.contains('active')) {
//         switch(event.key) {
//             case '1':
//                 if (!isInputField) {
//                     addScore('home');
//                 }
//                 break;
//             case '2':
//                 if (!isInputField) {
//                     addScore('away');
//                 }
//                 break;
//             case 'h':
//             case 'H':
//                 if ((event.ctrlKey || event.metaKey) && !isInputField) {
//                     event.preventDefault();
//                     manualRotateHome();
//                 }
//                 break;
//             case 'a':
//             case 'A':
//                 if ((event.ctrlKey || event.metaKey) && !isInputField) {
//                     event.preventDefault();
//                     manualRotateAway();
//                 }
//                 break;
//             case 'Escape':
//                 showSetup();
//                 break;
//         }
//     }
// });

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

// PWA 支援
let deferredPrompt;
let installButton;

// Service Worker 註冊
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('[PWA] ServiceWorker 註冊成功:', registration.scope);
                
                // 檢查是否有新版本
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 顯示更新通知
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('[PWA] ServiceWorker 註冊失敗:', error);
            });
    });
}

// 監聽安裝提示事件
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] 安裝提示事件觸發');
    // 阻止瀏覽器的預設安裝提示
    e.preventDefault();
    // 保存事件，稍後使用
    deferredPrompt = e;
    // 顯示自定義安裝按鈕
    showInstallPrompt();
});

// 監聽應用安裝事件
window.addEventListener('appinstalled', (evt) => {
    console.log('[PWA] 應用已安裝');
    hideInstallPrompt();
    // 可以在這裡添加分析追蹤
});

// 顯示安裝提示
function showInstallPrompt() {
    // 創建安裝提示元素
    if (!document.getElementById('install-prompt')) {
        const installPrompt = document.createElement('div');
        installPrompt.id = 'install-prompt';
        installPrompt.className = 'install-prompt';
        installPrompt.innerHTML = `
            <div class="install-prompt-content">
                <span class="install-text">📱 安裝NCUE排球聯盟到您的裝置</span>
                <button id="install-button" class="install-btn">安裝</button>
                <button id="dismiss-button" class="dismiss-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(installPrompt);
        
        // 綁定事件
        document.getElementById('install-button').addEventListener('click', installApp);
        document.getElementById('dismiss-button').addEventListener('click', hideInstallPrompt);
        
        // 3秒後自動顯示
        setTimeout(() => {
            installPrompt.classList.add('show');
        }, 3000);
    }
}

// 隱藏安裝提示
function hideInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
        installPrompt.classList.remove('show');
        setTimeout(() => {
            installPrompt.remove();
        }, 300);
    }
}

// 安裝應用
async function installApp() {
    if (deferredPrompt) {
        // 顯示安裝提示
        deferredPrompt.prompt();
        // 等待用戶響應
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] 用戶選擇: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('[PWA] 用戶接受安裝');
        } else {
            console.log('[PWA] 用戶拒絕安裝');
        }
        
        // 清除保存的提示
        deferredPrompt = null;
        hideInstallPrompt();
    }
}

// 顯示更新通知
function showUpdateNotification() {
    if (!document.getElementById('update-notification')) {
        const updateNotification = document.createElement('div');
        updateNotification.id = 'update-notification';
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <span class="update-text">🔄 新版本可用</span>
                <button id="update-button" class="update-btn">更新</button>
                <button id="update-dismiss" class="dismiss-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(updateNotification);
        
        // 綁定事件
        document.getElementById('update-button').addEventListener('click', () => {
            // 通知Service Worker跳過等待
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
        
        document.getElementById('update-dismiss').addEventListener('click', () => {
            updateNotification.remove();
        });
        
        // 顯示通知
        setTimeout(() => {
            updateNotification.classList.add('show');
        }, 100);
    }
}

// 檢查是否在獨立模式運行（已安裝為PWA）
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// 如果是PWA模式，添加特殊樣式
if (isPWA()) {
    document.body.classList.add('pwa-mode');
    console.log('[PWA] 運行在獨立模式');
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
            
            <h3>左側球員位置：</h3>
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
            
            <h3>右側球員位置：</h3>
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

// 顯示替換介面
function showSubstitution() {
    try {
        const modal = document.getElementById('substitution-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show');
            
            // 更新球員選項
            updatePlayerOptions();
            updateSubstitutionCounts();
            updateSubstitutionLog();
        }
    } catch (error) {
        console.error('顯示替換介面時發生錯誤:', error);
        alert('無法開啟替換介面，請重新整理頁面後再試。');
    }
}

// 隱藏替換介面
function hideSubstitution() {
    try {
        const modal = document.getElementById('substitution-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
        
        // 清除輸入
        const homePlayerOut = document.getElementById('home-player-out');
        const homePlayerIn = document.getElementById('home-player-in');
        const awayPlayerOut = document.getElementById('away-player-out');
        const awayPlayerIn = document.getElementById('away-player-in');
        
        if (homePlayerOut) homePlayerOut.value = '';
        if (homePlayerIn) homePlayerIn.value = '';
        if (awayPlayerOut) awayPlayerOut.value = '';
        if (awayPlayerIn) awayPlayerIn.value = '';
    } catch (error) {
        console.error('隱藏替換介面時發生錯誤:', error);
    }
}

// 更新球員選項
function updatePlayerOptions() {
    try {
        const homeSelect = document.getElementById('home-player-out');
        const awaySelect = document.getElementById('away-player-out');
        
        if (!homeSelect || !awaySelect) {
            console.error('找不到球員選擇元素');
            return;
        }
        
        // 清除現有選項
        homeSelect.innerHTML = '<option value="">選擇球員</option>';
        awaySelect.innerHTML = '<option value="">選擇球員</option>';
        
        // 添加左側球員選項（不包含自由球員）
        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}號位 - #${gameState.homeTeam.players[i]}`;
            homeSelect.appendChild(option);
        }
        
        // 添加右側球員選項（不包含自由球員）
        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}號位 - #${gameState.awayTeam.players[i]}`;
            awaySelect.appendChild(option);
        }
    } catch (error) {
        console.error('更新球員選項時發生錯誤:', error);
    }
}

// 更新替換次數顯示
function updateSubstitutionCounts() {
    try {
        const homeCountElement = document.getElementById('home-sub-count');
        const awayCountElement = document.getElementById('away-sub-count');
        
        if (homeCountElement) {
            homeCountElement.textContent = gameState.substitutions.home.count;
        }
        if (awayCountElement) {
            awayCountElement.textContent = gameState.substitutions.away.count;
        }
    } catch (error) {
        console.error('更新替換次數時發生錯誤:', error);
    }
}

// 更新替換記錄
function updateSubstitutionLog() {
    const log = document.getElementById('substitution-log');
    const allSubs = [
        ...gameState.substitutions.home.history,
        ...gameState.substitutions.away.history
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (allSubs.length === 0) {
        log.innerHTML = '<div style="color: #999;">尚無替換記錄</div>';
    } else {
        log.innerHTML = allSubs.map(sub => 
            `<div style="margin-bottom: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px;">
                <strong>${sub.team}：</strong>#${sub.playerOut} 下場 → #${sub.playerIn} 上場
                <div style="font-size: 12px; color: #666;">${sub.timestamp}</div>
            </div>`
        ).join('');
    }
}

// 執行替換
function makeSubstitution(team) {
    const playerOutSelect = document.getElementById(`${team}-player-out`);
    const playerInInput = document.getElementById(`${team}-player-in`);
    
    const position = playerOutSelect.value;
    const playerOut = gameState[team + 'Team'].players[position];
    const playerIn = playerInInput.value;
    
    // 驗證輸入
    if (!position) {
        alert('請選擇下場球員');
        return;
    }
    
    if (!playerIn || playerIn < 1 || playerIn > 99) {
        alert('請輸入有效的上場球員背號（1-99）');
        return;
    }
    
    // 檢查替換次數限制
    if (gameState.substitutions[team].count >= 6) {
        alert('本局替換次數已達上限（6次）');
        return;
    }
    
    // 檢查背號是否重複
    const teamData = gameState[team + 'Team'];
    for (let i = 1; i <= 6; i++) {
        if (i != position && teamData.players[i] == playerIn) {
            alert('背號重複！該球員已在場上');
            return;
        }
    }
    if (teamData.libero == playerIn) {
        alert('背號重複！該背號為自由球員');
        return;
    }
    
    // 保存替換前的狀態到歷史記錄
    const beforeState = {
        type: 'substitution',
        team: team,
        position: position,
        playerOut: playerOut,
        playerIn: playerIn,
        subCount: gameState.substitutions[team].count,
        subHistory: [...gameState.substitutions[team].history]
    };
    
    // 執行替換
    gameState[team + 'Team'].players[position] = playerIn;
    
    // 記錄替換
    const substitution = {
        team: gameState[team + 'Team'].name,
        position: position,
        playerOut: playerOut,
        playerIn: playerIn,
        timestamp: new Date().toLocaleString('zh-TW')
    };
    
    gameState.substitutions[team].history.push(substitution);
    gameState.substitutions[team].count++;
    
    // 添加到輪轉記錄
    addToLog(`${gameState[team + 'Team'].name}替換：${position}號位 #${playerOut} → #${playerIn}`);
    
    // 保存到歷史記錄
    saveActionToHistory(beforeState);
    
    // 更新顯示
    updateDisplay();
    updateSubstitutionCounts();
    updateSubstitutionLog();
    saveGameState();
    
    // 清除輸入
    playerOutSelect.value = '';
    playerInInput.value = '';
    
    alert(`替換成功！${position}號位：#${playerOut} → #${playerIn}`);
}

// 顯示手動設定介面
function showManualSettings() {
    try {
        const modal = document.getElementById('manual-settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show');
            
            // 更新回溯按鈕狀態
            updateUndoButtonInModal();
        }
    } catch (error) {
        console.error('顯示手動設定介面時發生錯誤:', error);
        alert('無法開啟手動設定介面，請重新整理頁面後再試。');
    }
}

// 隱藏手動設定介面
function hideManualSettings() {
    try {
        const modal = document.getElementById('manual-settings-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    } catch (error) {
        console.error('隱藏手動設定介面時發生錯誤:', error);
    }
}

// 更新模態框中的回溯按鈕狀態
function updateUndoButtonInModal() {
    const undoButton = document.querySelector('.btn-undo-modal');
    if (undoButton) {
        if (gameState.actionHistory.length === 0) {
            undoButton.disabled = true;
            undoButton.textContent = '⟲ 回溯操作 (無操作)';
        } else {
            undoButton.disabled = false;
            const lastAction = gameState.actionHistory[gameState.actionHistory.length - 1];
            let actionText = '';
            
            if (lastAction.type === 'score') {
                actionText = `撤銷${gameState[lastAction.team + 'Team'].name}得分`;
            } else if (lastAction.type === 'rotation') {
                actionText = `撤銷${lastAction.team === 'home' ? gameState.homeTeam.name : gameState.awayTeam.name}輪轉`;
            } else if (lastAction.type === 'substitution') {
                actionText = `撤銷${gameState[lastAction.team + 'Team'].name}替換`;
            } else if (lastAction.type === 'swap') {
                actionText = `撤銷左右交換`;
            }
            
            undoButton.textContent = `⟲ 回溯操作 (${actionText})`;
        }
    }
}

// 暫停計時相關變數
let timeoutInterval = null;
let timeoutSeconds = 30;
let timeoutRunning = false;

// 顯示暫停計時介面
function showTimeout() {
    try {
        const modal = document.getElementById('timeout-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show');
            
            // 重置計時器
            resetTimeout();
            // 自動開始計時
            startTimeout();
        }
    } catch (error) {
        console.error('顯示暫停計時介面時發生錯誤:', error);
        alert('無法開啟暫停計時介面，請重新整理頁面後再試。');
    }
}

// 隱藏暫停計時介面
function hideTimeout() {
    try {
        const modal = document.getElementById('timeout-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
            
            // 停止計時
            stopTimeout();
        }
    } catch (error) {
        console.error('隱藏暫停計時介面時發生錯誤:', error);
    }
}

// 開始計時
function startTimeout() {
    if (timeoutRunning) return;
    
    timeoutRunning = true;
    updateTimeoutToggleButton();
    
    timeoutInterval = setInterval(() => {
        timeoutSeconds--;
        updateTimeoutDisplay();
        
        if (timeoutSeconds <= 0) {
            stopTimeout();
            // 播放提示音（可選）
            playTimeoutSound();
        }
    }, 1000);
}

// 停止計時
function stopTimeout() {
    timeoutRunning = false;
    if (timeoutInterval) {
        clearInterval(timeoutInterval);
        timeoutInterval = null;
    }
    updateTimeoutToggleButton();
}

// 切換計時狀態
function toggleTimeout() {
    if (timeoutRunning) {
        stopTimeout();
    } else {
        if (timeoutSeconds <= 0) {
            resetTimeout();
        }
        startTimeout();
    }
}

// 重置計時器
function resetTimeout() {
    stopTimeout();
    timeoutSeconds = 30;
    updateTimeoutDisplay();
}

// 更新顯示
function updateTimeoutDisplay() {
    const timeDisplay = document.getElementById('timeout-time');
    const progressCircle = document.getElementById('timeout-progress-circle');
    
    if (timeDisplay) {
        timeDisplay.textContent = timeoutSeconds;
        
        // 時間小於等於5秒時變紅色並閃爍
        if (timeoutSeconds <= 5) {
            timeDisplay.style.color = '#f44336';
            if (timeoutSeconds % 2 === 0) {
                timeDisplay.style.transform = 'translate(-50%, -50%) scale(1.1)';
            } else {
                timeDisplay.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        } else {
            timeDisplay.style.color = '#FF5722';
            timeDisplay.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    if (progressCircle) {
        const circumference = 565.48;
        const progress = (timeoutSeconds / 30) * circumference;
        progressCircle.style.strokeDashoffset = circumference - progress;
        
        // 時間小於等於5秒時進度條變紅
        if (timeoutSeconds <= 5) {
            progressCircle.style.stroke = '#f44336';
        } else {
            progressCircle.style.stroke = '#FF5722';
        }
    }
}

// 更新切換按鈕文字
function updateTimeoutToggleButton() {
    const toggleButton = document.getElementById('timeout-toggle');
    if (toggleButton) {
        toggleButton.textContent = timeoutRunning ? '暫停' : '繼續';
    }
}

// 播放提示音（簡單的嗶聲）
function playTimeoutSound() {
    try {
        // 使用 Web Audio API 播放簡單的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('無法播放提示音:', error);
    }
}

// 點擊模態框背景關閉
document.addEventListener('click', function(event) {
    const substitutionModal = document.getElementById('substitution-modal');
    const manualSettingsModal = document.getElementById('manual-settings-modal');
    const timeoutModal = document.getElementById('timeout-modal');
    
    if (event.target === substitutionModal) {
        hideSubstitution();
    }
    
    if (event.target === manualSettingsModal) {
        hideManualSettings();
    }
    
    if (event.target === timeoutModal) {
        hideTimeout();
    }
});

// 交換左右兩側隊伍
function swapTeamSides() {
    if (!confirm('確定要交換左右兩側隊伍嗎？這將交換分數、隊名、輪轉位置及發球權。')) {
        return;
    }
    
    // 保存當前狀態到歷史記錄
    const beforeState = {
        type: 'swap',
        homeTeam: JSON.parse(JSON.stringify(gameState.homeTeam)),
        awayTeam: JSON.parse(JSON.stringify(gameState.awayTeam)),
        substitutions: JSON.parse(JSON.stringify(gameState.substitutions))
    };
    
    // 交換隊伍資料
    const tempTeam = {
        name: gameState.homeTeam.name,
        score: gameState.homeTeam.score,
        hasServe: gameState.homeTeam.hasServe,
        players: { ...gameState.homeTeam.players },
        libero: gameState.homeTeam.libero
    };
    
    gameState.homeTeam.name = gameState.awayTeam.name;
    gameState.homeTeam.score = gameState.awayTeam.score;
    gameState.homeTeam.hasServe = gameState.awayTeam.hasServe;
    gameState.homeTeam.players = { ...gameState.awayTeam.players };
    gameState.homeTeam.libero = gameState.awayTeam.libero;
    
    gameState.awayTeam.name = tempTeam.name;
    gameState.awayTeam.score = tempTeam.score;
    gameState.awayTeam.hasServe = tempTeam.hasServe;
    gameState.awayTeam.players = { ...tempTeam.players };
    gameState.awayTeam.libero = tempTeam.libero;
    
    // 交換替換記錄
    const tempSubstitutions = gameState.substitutions.home;
    gameState.substitutions.home = gameState.substitutions.away;
    gameState.substitutions.away = tempSubstitutions;
    
    // 記錄到日誌
    addToLog(`左右兩側交換完成 (${gameState.homeTeam.name} ${gameState.homeTeam.score}:${gameState.awayTeam.score} ${gameState.awayTeam.name})`);
    
    // 保存到歷史記錄
    saveActionToHistory(beforeState);
    
    // 更新顯示
    updateDisplay();
    saveGameState();
}
