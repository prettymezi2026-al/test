/**
 * 「10 만들기 탐험대」 메인 애플리케이션 및 Firebase / 게임 상태 컨트롤러
 */

import { 
  auth, 
  db, 
  isFirebaseConfigured, 
  signInWithPopup, 
  googleProvider, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from './firebaseConfig.js';

import { MathEngine } from './gameLogic.js';

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const lobbyView = document.getElementById('lobby-view');
  const minigame1View = document.getElementById('minigame-1-view');
  const minigame2View = document.getElementById('minigame-2-view');
  const minigame3View = document.getElementById('minigame-3-view');
  const bossView = document.getElementById('boss-view');
  const leaderboardView = document.getElementById('leaderboard-view');

  // DOM Buttons & Badges
  const goldCountEl = document.getElementById('gold-count');
  const userDisplayNameEl = document.getElementById('user-display-name');
  const userAvatarEl = document.getElementById('user-avatar');

  const btnGoogleLogin = document.getElementById('btn-google-login');
  const btnAnonLogin = document.getElementById('btn-anon-login');
  const btnLogout = document.getElementById('btn-logout');

  const cardGame1 = document.getElementById('card-game-1');
  const cardGame2 = document.getElementById('card-game-2');
  const cardGame3 = document.getElementById('card-game-3');

  const bossCard = document.getElementById('boss-card');
  const btnStartBoss = document.getElementById('btn-start-boss');
  const bossLockDesc = document.getElementById('boss-lock-desc');

  const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
  const btnBackButtons = document.querySelectorAll('.btn-back-lobby');

  // Tabs for Leaderboard
  const tabBossSpeed = document.getElementById('tab-boss-speed');
  const tabGoldAccum = document.getElementById('tab-gold-accum');
  const tabBossClear = document.getElementById('tab-boss-clear');
  const rankListEl = document.getElementById('rank-list');

  // Game States
  let currentUser = null;
  let gold = parseInt(localStorage.getItem('vibe_gold') || '0', 10);
  let bossClears = parseInt(localStorage.getItem('vibe_boss_clears') || '0', 10);

  // Update UI State
  updateGoldUI();

  // Auth Observers
  if (isFirebaseConfigured && auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        userDisplayNameEl.textContent = user.displayName || (user.isAnonymous ? '익명 탐험가' : '탐험가');
        userAvatarEl.textContent = user.isAnonymous ? '👤' : '👦';
        btnGoogleLogin.style.display = 'none';
        btnAnonLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
        syncUserData(user.uid);
      } else {
        currentUser = null;
        userDisplayNameEl.textContent = '익명 탐험가';
        btnGoogleLogin.style.display = 'inline-block';
        btnAnonLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
      }
    });
  }

  // Auth Event Listeners
  btnGoogleLogin.addEventListener('click', async () => {
    try {
      if (isFirebaseConfigured) await signInWithPopup(auth, googleProvider);
      else alert("Firebase 설정이 필요합니다. 익명 플레이로 진행합니다.");
    } catch (e) {
      console.error(e);
      alert("로그인 중 오류가 발생했습니다.");
    }
  });

  btnAnonLogin.addEventListener('click', async () => {
    try {
      if (isFirebaseConfigured) await signInAnonymously(auth);
      else alert("익명 모드로 플레이합니다.");
    } catch (e) {
      console.error(e);
    }
  });

  btnLogout.addEventListener('click', () => {
    if (isFirebaseConfigured) signOut(auth);
  });

  // View Navigation
  function switchView(targetView) {
    [lobbyView, minigame1View, minigame2View, minigame3View, bossView, leaderboardView].forEach(v => v.classList.remove('active'));
    targetView.classList.add('active');
  }

  btnBackButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (speedTimerInterval) clearInterval(speedTimerInterval);
      if (bossTimerInterval) clearInterval(bossTimerInterval);
      switchView(lobbyView);
    });
  });

  // Gold & Boss Unlocking & Level EXP
  function updateGoldUI() {
    goldCountEl.textContent = gold;
    localStorage.setItem('vibe_gold', gold.toString());
    localStorage.setItem('vibe_boss_clears', bossClears.toString());

    // Level & EXP Progress Calculation for 6th Graders
    const levelTagEl = document.getElementById('user-level-tag');
    const expBarFillEl = document.getElementById('exp-bar-fill');

    let levelName = 'Lv.1 초보 탐험가';
    let expPercent = Math.min(100, (gold / 100) * 100);

    if (bossClears >= 5 || gold >= 300) {
      levelName = 'Lv.4 👑 10 전설의 마스터';
      expPercent = 100;
    } else if (bossClears >= 2 || gold >= 200) {
      levelName = 'Lv.3 ⚔️ 10 보스 사냥꾼';
      expPercent = Math.min(100, ((gold - 200) / 100) * 100);
    } else if (bossClears >= 1 || gold >= 100) {
      levelName = 'Lv.2 🌟 10 숙련 탐험가';
      expPercent = Math.min(100, ((gold - 100) / 100) * 100);
    }

    if (levelTagEl) levelTagEl.textContent = levelName;
    if (expBarFillEl) expBarFillEl.style.width = `${expPercent}%`;

    if (gold >= 100) {
      bossCard.className = 'boss-card unlocked';
      bossLockDesc.textContent = '던전 열림! ⚔️ (10문제 타임어택 도전 가능)';
      btnStartBoss.disabled = false;
    } else {
      bossCard.className = 'boss-card locked';
      bossLockDesc.textContent = `도전 자격: 100 Gold 필요 (현재 ${gold}/100 Gold 🪙)`;
      btnStartBoss.disabled = true;
    }
  }

  function addGold(amount) {
    gold += amount;
    updateGoldUI();
    alert(`🎉 축하합니다! +${amount} Gold를 획득했습니다!`);
  }

  // ----------------------------------------------------
  // MINIGAME 1: BUBBLE POP
  // ----------------------------------------------------
  cardGame1.addEventListener('click', () => {
    switchView(minigame1View);
    startBubbleGame();
  });

  function startBubbleGame() {
    const container = document.getElementById('bubble-container');
    container.innerHTML = '';

    const numbers = [1, 9, 2, 8, 3, 7, 4, 6, 5, 5, 2, 8]; // Pairs sum to 10
    numbers.sort(() => Math.random() - 0.5);

    let selectedBubble = null;
    let matchedPairs = 0;

    numbers.forEach((num, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble-item';
      bubble.textContent = num;

      bubble.addEventListener('click', () => {
        if (bubble.style.visibility === 'hidden') return;

        if (!selectedBubble) {
          selectedBubble = { el: bubble, val: num };
          bubble.classList.add('selected');
        } else {
          if (selectedBubble.el === bubble) {
            bubble.classList.remove('selected');
            selectedBubble = null;
            return;
          }

          if (selectedBubble.val + num === 10) {
            // Success Match
            bubble.style.visibility = 'hidden';
            selectedBubble.el.style.visibility = 'hidden';
            selectedBubble = null;
            matchedPairs++;

            if (matchedPairs === numbers.length / 2) {
              setTimeout(() => {
                addGold(20);
                switchView(lobbyView);
              }, 300);
            }
          } else {
            // Fail
            selectedBubble.el.classList.remove('selected');
            selectedBubble = null;
          }
        }
      });

      container.appendChild(bubble);
    });
  }

  // ----------------------------------------------------
  // MINIGAME 2: SPEED QUIZ
  // ----------------------------------------------------
  let speedTimerInterval;
  cardGame2.addEventListener('click', () => {
    switchView(minigame2View);
    startSpeedQuiz();
  });

  function startSpeedQuiz() {
    const { a, b } = MathEngine.getRandomPair();
    const qText = document.getElementById('speed-q-text');
    const timerFill = document.getElementById('speed-timer-fill');
    const optionsGrid = document.getElementById('speed-options-grid');

    qText.textContent = `${a} + ? = 10`;
    optionsGrid.innerHTML = '';
    timerFill.style.width = '100%';

    const options = MathEngine.generateOptions(b);
    options.forEach(optVal => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn-game';
      btn.textContent = optVal;

      btn.addEventListener('click', () => {
        clearInterval(speedTimerInterval);
        if (optVal === b) {
          addGold(30);
        } else {
          alert("아쉽네요! 시간 초과 또는 오답입니다.");
        }
        switchView(lobbyView);
      });
      optionsGrid.appendChild(btn);
    });

    // 3 Second Countdown Timer
    let startTime = Date.now();
    const duration = 3000;
    clearInterval(speedTimerInterval);

    speedTimerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, (1 - elapsed / duration) * 100);
      timerFill.style.width = `${remainingPercent}%`;

      if (elapsed >= duration) {
        clearInterval(speedTimerInterval);
        alert("시간 초과! 3초 안에 선택하지 못했습니다.");
        switchView(lobbyView);
      }
    }, 50);
  }

  // ----------------------------------------------------
  // MINIGAME 3: BLOCK ADDITION
  // ----------------------------------------------------
  cardGame3.addEventListener('click', () => {
    switchView(minigame3View);
    startBlockGame();
  });

  function startBlockGame() {
    const board = document.getElementById('block-board');
    board.innerHTML = '';

    const blocks = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
    blocks.sort(() => Math.random() - 0.5);

    let selectedBlocks = [];

    blocks.forEach(val => {
      const blockEl = document.createElement('div');
      blockEl.className = 'block-num';
      blockEl.textContent = val;

      blockEl.addEventListener('click', () => {
        if (blockEl.classList.contains('selected')) {
          blockEl.classList.remove('selected');
          selectedBlocks = selectedBlocks.filter(b => b.el !== blockEl);
        } else {
          blockEl.classList.add('selected');
          selectedBlocks.push({ el: blockEl, val });
        }

        const currentSum = selectedBlocks.reduce((acc, curr) => acc + curr.val, 0);

        if (currentSum === 10) {
          selectedBlocks.forEach(b => b.el.style.visibility = 'hidden');
          selectedBlocks = [];

          const remaining = board.querySelectorAll('.block-num:not([style*="visibility: hidden"])');
          if (remaining.length <= 2) {
            setTimeout(() => {
              addGold(30);
              switchView(lobbyView);
            }, 300);
          }
        } else if (currentSum > 10) {
          alert(`합이 ${currentSum}이 되었습니다! (10을 초과함)`);
          selectedBlocks.forEach(b => b.el.classList.remove('selected'));
          selectedBlocks = [];
        }
      });

      board.appendChild(blockEl);
    });
  }

  // ----------------------------------------------------
  // BOSS RAID (10 QUESTIONS TIME-ATTACK)
  // ----------------------------------------------------
  let bossQuestions = [];
  let currentBossQIdx = 0;
  let bossHp = 10;
  let bossStartTime = 0;
  let bossTimerInterval;
  let bossCorrectAnswers = 0;

  btnStartBoss.addEventListener('click', () => {
    if (gold < 100) return;
    gold -= 100; // Consume 100 gold
    updateGoldUI();

    switchView(bossView);
    startBossRaid();
  });

  function startBossRaid() {
    bossQuestions = MathEngine.generateBossQuestions();
    currentBossQIdx = 0;
    bossHp = 10;
    bossCorrectAnswers = 0;
    bossStartTime = performance.now();

    updateBossHpUI();
    renderBossQuestion();

    // Timer Update
    const timerTextEl = document.getElementById('boss-timer-text');
    clearInterval(bossTimerInterval);
    bossTimerInterval = setInterval(() => {
      const elapsed = (performance.now() - bossStartTime) / 1000;
      timerTextEl.textContent = `${elapsed.toFixed(2)}초`;
    }, 30);
  }

  function updateBossHpUI() {
    document.getElementById('boss-hp-text').textContent = `${bossHp} / 10`;
    document.getElementById('boss-hp-fill').style.width = `${(bossHp / 10) * 100}%`;
    document.getElementById('boss-progress-text').textContent = `${currentBossQIdx + 1} / 10`;
  }

  function renderBossQuestion() {
    const q = bossQuestions[currentBossQIdx];
    document.getElementById('boss-q-text').textContent = q.questionText;

    const optionsGrid = document.getElementById('boss-options-grid');
    optionsGrid.innerHTML = '';

    q.options.forEach(optVal => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn-game';
      btn.textContent = optVal;

      btn.addEventListener('click', () => {
        if (optVal === q.answer) {
          bossHp = Math.max(0, bossHp - 1);
          bossCorrectAnswers++;
        }

        currentBossQIdx++;
        updateBossHpUI();

        if (currentBossQIdx < 10) {
          renderBossQuestion();
        } else {
          // Boss Raid Complete
          clearInterval(bossTimerInterval);
          const totalTimeSec = parseFloat(((performance.now() - bossStartTime) / 1000).toFixed(2));
          finishBossRaid(totalTimeSec);
        }
      });

      optionsGrid.appendChild(btn);
    });
  }

  async function finishBossRaid(timeSec) {
    bossClears++;
    localStorage.setItem('vibe_boss_clears', bossClears.toString());

    alert(`⚔️ 보스 대결 종료!\n- 정답 수: ${bossCorrectAnswers} / 10개\n- 걸린 시간: ${timeSec}초`);

    // Save record if 100% accuracy (10/10)
    const playerName = userDisplayNameEl.textContent || '익명 탐험가';
    if (bossCorrectAnswers === 10) {
      alert(`🎉 100% 정답 명예의 전당 기록 등록 대상입니다! (${timeSec}초)`);
      await saveLeaderboardRecord(playerName, timeSec, gold, bossClears);
    } else {
      alert(`💡 10문제를 모두 맞춰야 보스 최단시간 명예의 전당 10위에 들어갈 수 있습니다!`);
    }

    switchView(lobbyView);
  }

  // ----------------------------------------------------
  // LEADERBOARD & FIRESTORE INTEGRATION
  // ----------------------------------------------------
  btnOpenLeaderboard.addEventListener('click', () => {
    switchView(leaderboardView);
    loadLeaderboard('boss-speed');
  });

  tabBossSpeed.addEventListener('click', () => {
    setActiveTab(tabBossSpeed);
    loadLeaderboard('boss-speed');
  });

  tabGoldAccum.addEventListener('click', () => {
    setActiveTab(tabGoldAccum);
    loadLeaderboard('gold-accum');
  });

  tabBossClear.addEventListener('click', () => {
    setActiveTab(tabBossClear);
    loadLeaderboard('boss-clear');
  });

  function setActiveTab(selectedTab) {
    [tabBossSpeed, tabGoldAccum, tabBossClear].forEach(t => t.classList.remove('active'));
    selectedTab.classList.add('active');
  }

  async function saveLeaderboardRecord(name, timeSec, currentGold, clears) {
    const record = {
      name,
      timeSec,
      gold: currentGold,
      clears,
      createdAt: new Date().toISOString()
    };

    // Save to LocalStorage fallback
    let localRanks = JSON.parse(localStorage.getItem('vibe_ranks_boss') || '[]');
    localRanks.push(record);
    localRanks.sort((a, b) => a.timeSec - b.timeSec);
    localRanks = localRanks.slice(0, 10);
    localStorage.setItem('vibe_ranks_boss', JSON.stringify(localRanks));

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "leaderboard_boss_speed"), {
          ...record,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Firestore save error:", e);
      }
    }
  }

  async function syncUserData(uid) {
    if (!isFirebaseConfigured || !db) return;
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.gold) {
          gold = Math.max(gold, data.gold);
          updateGoldUI();
        }
      } else {
        await setDoc(userRef, { gold, bossClears, updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.error("User sync error:", e);
    }
  }

  async function loadLeaderboard(type) {
    rankListEl.innerHTML = '<div style="text-align:center; padding:20px;">로딩 중...</div>';

    let records = [];

    if (type === 'boss-speed') {
      // Local Fallback
      records = JSON.parse(localStorage.getItem('vibe_ranks_boss') || '[]');

      // Firestore load if enabled
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, "leaderboard_boss_speed"), orderBy("timeSec", "asc"), limit(10));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            records = snapshot.docs.map(d => d.data());
          }
        } catch (e) {
          console.warn("Firestore fallback to local:", e);
        }
      }
    } else if (type === 'gold-accum') {
      records = [
        { name: userDisplayNameEl.textContent, gold: gold }
      ];
    } else {
      records = [
        { name: userDisplayNameEl.textContent, clears: bossClears }
      ];
    }

    renderRankListUI(records, type);
  }

  function renderRankListUI(records, type) {
    rankListEl.innerHTML = '';
    if (records.length === 0) {
      rankListEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">아직 기록이 없습니다. 도전해보세요!</div>';
      return;
    }

    records.forEach((rec, idx) => {
      const item = document.createElement('div');
      item.className = `rank-item ${idx < 3 ? 'top3' : ''}`;

      let valText = '';
      if (type === 'boss-speed') valText = `⚡ ${rec.timeSec}초 (100% 정답)`;
      else if (type === 'gold-accum') valText = `💰 ${rec.gold} Gold`;
      else valText = `⚔️ ${rec.clears}회 클리어`;

      item.innerHTML = `
        <span class="rank-num">${idx + 1}위</span>
        <span class="rank-name">${rec.name || '익명 탐험가'}</span>
        <span class="rank-score">${valText}</span>
      `;
      rankListEl.appendChild(item);
    });
  }
});
