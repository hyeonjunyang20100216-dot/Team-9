(function () {
  'use strict';

  const BL = window.BeneduLand;

  const homePage = document.getElementById('homePage');
  const gamePage = document.getElementById('gamePage');
  const loginForm = document.getElementById('loginForm');
  const classSelect = document.getElementById('classSelect');
  const studentName = document.getElementById('studentName');
  const matchNotice = document.getElementById('matchNotice');
  const resetUserBtn = document.getElementById('resetUserBtn');
  const refreshBtn = document.getElementById('refreshBtn');

  const matchPair = document.getElementById('matchPair');
  const playerBadge = document.getElementById('playerBadge');
  const gameTimer = document.getElementById('gameTimer');
  const boardEl = document.getElementById('board');
  const playerStats = document.getElementById('playerStats');
  const classScores = document.getElementById('classScores');
  const logList = document.getElementById('logList');

  const leftRatioText = document.getElementById('leftRatioText');
  const rightRatioText = document.getElementById('rightRatioText');
  const neutralText = document.getElementById('neutralText');
  const leftRatioBar = document.getElementById('leftRatioBar');
  const neutralRatioBar = document.getElementById('neutralRatioBar');
  const rightRatioBar = document.getElementById('rightRatioBar');

  const questionModal = document.getElementById('questionModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const questionMeta = document.getElementById('questionMeta');
  const questionTitle = document.getElementById('questionTitle');
  const questionText = document.getElementById('questionText');
  const choiceList = document.getElementById('choiceList');
  const submitAnswerBtn = document.getElementById('submitAnswerBtn');

  let currentUser = BL.getUser();
  let activeProblem = null;
  let activeCellIndex = null;
  let selectedChoiceIndex = null;
  let timer = null;
  let lockRenderTimer = null;
  let logRenderTimer = null;

  function init() {
    paintLoginMatchNotice();
    bindEvents();
    if (currentUser) {
      const match = BL.getMatch();
      if (match && match.teams.includes(Number(currentUser.classNo)) && match.status !== 'ended') {
        enterGame(currentUser, true);
      } else {
        BL.clearUser();
        currentUser = null;
        renderHome();
      }
    } else {
      renderHome();
    }
  }

  function bindEvents() {
    loginForm.addEventListener('submit', handleLogin);
    resetUserBtn.addEventListener('click', handleLogout);
    refreshBtn.addEventListener('click', function () {
      renderGame();
      BL.showToast('화면을 새로고침했습니다.');
    });
    closeModalBtn.addEventListener('click', closeQuestionModal);
    questionModal.addEventListener('click', function (event) {
      if (event.target === questionModal) closeQuestionModal();
    });
    submitAnswerBtn.addEventListener('click', submitAnswer);
    window.addEventListener('storage', function (event) {
      if (event.key === BL.STORAGE_KEY) {
        paintLoginMatchNotice();
        if (!gamePage.classList.contains('hidden')) renderGame();
      }
    });
  }

  function renderHome() {
    document.body.classList.add('is-home');
    homePage.classList.remove('hidden');
    gamePage.classList.add('hidden');
    paintLoginMatchNotice();
    stopTimers();
  }

  function enterGame(user, silent) {
    let match = BL.getMatch();
    if (!match) {
      BL.showToast('어드민에서 경기를 먼저 시작해야 합니다.');
      renderHome();
      return;
    }
    if (!match.teams.includes(Number(user.classNo))) {
      BL.showToast('현재 경기 참가 반이 아닙니다.');
      renderHome();
      return;
    }
    if (match.status === 'ended') {
      BL.showToast('이미 종료된 경기입니다.');
      renderHome();
      return;
    }

    match = BL.startTimerIfNeeded(match);
    currentUser = user;
    BL.saveUser(user);
    document.body.classList.remove('is-home');
    homePage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    startTimers();
    renderGame();
    if (!silent) BL.showToast(`${BL.getTeamName(user.classNo)} ${user.name} 입장`);
  }

  function handleLogin(event) {
    event.preventDefault();
    const classNo = Number(classSelect.value);
    const name = studentName.value.trim().replace(/\s+/g, ' ');
    const match = BL.getMatch();

    if (!classNo || !name) {
      BL.showToast('반과 이름을 입력하세요.');
      return;
    }
    if (!match) {
      BL.showToast('어드민에서 경기를 먼저 시작해야 입장할 수 있습니다.');
      return;
    }
    if (!match.teams.includes(classNo)) {
      const pair = `${BL.getTeamName(match.teams[0])} vs ${BL.getTeamName(match.teams[1])}`;
      BL.showToast(`현재 경기는 ${pair}입니다. 해당 반만 입장 가능합니다.`);
      return;
    }
    enterGame({ classNo, name }, false);
  }

  function handleLogout() {
    BL.clearUser();
    currentUser = null;
    closeQuestionModal();
    renderHome();
    BL.showToast('로그아웃했습니다.');
  }

  function paintLoginMatchNotice() {
    const match = BL.syncEnded(BL.getMatch());
    if (!match) {
      BL.setText(matchNotice, '어드민에서 경기를 먼저 시작해야 합니다.');
      return;
    }
    const pair = `${BL.getTeamName(match.teams[0])} vs ${BL.getTeamName(match.teams[1])}`;
    if (match.status === 'waiting') {
      BL.setText(matchNotice, `${pair} 경기 대기 중. 첫 입장부터 20분 타이머가 시작됩니다.`);
    } else if (match.status === 'running') {
      BL.setText(matchNotice, `${pair} 진행 중. 남은 시간 ${BL.formatMs(BL.getRemainingMs(match))}`);
    } else {
      BL.setText(matchNotice, `${pair} 경기가 종료되었습니다. 어드민에서 새 경기를 열어야 합니다.`);
    }
  }

  function startTimers() {
    stopTimers();
    timer = window.setInterval(function () {
      const match = BL.syncEnded(BL.getMatch());
      if (!match || match.status === 'ended') {
        renderGame();
        return;
      }
      updateTimer(match);
    }, 1000);
    lockRenderTimer = window.setInterval(renderBoardLocksOnly, 1000);
    logRenderTimer = window.setInterval(function () {
      const match = BL.getMatch();
      if (match && !gamePage.classList.contains('hidden')) renderLogs(match);
    }, 500);
  }

  function stopTimers() {
    if (timer) window.clearInterval(timer);
    if (lockRenderTimer) window.clearInterval(lockRenderTimer);
    if (logRenderTimer) window.clearInterval(logRenderTimer);
    timer = null;
    lockRenderTimer = null;
    logRenderTimer = null;
  }

  function renderGame() {
    const match = BL.syncEnded(BL.cleanupLocks(BL.getMatch()));
    if (!currentUser || !match) {
      renderHome();
      return;
    }
    BL.saveMatch(match);
    renderMatchHeader(match);
    renderRatio(match);
    renderPlayerStats(match);
    renderScores(match);
    renderBoard(match);
    renderLogs(match);
    updateTimer(match);
  }

  function renderMatchHeader(match) {
    const leftTeam = match.teams[0];
    const rightTeam = match.teams[1];

    BL.setText(matchPair, `${BL.getTeamName(leftTeam)} vs ${BL.getTeamName(rightTeam)}`);
    BL.setText(playerBadge, `${BL.getTeamName(currentUser.classNo)} · ${currentUser.name}`);
  }

  function updateTimer(match) {
    if (!match) return;
    if (match.status === 'waiting') {
      BL.setText(gameTimer, '20:00');
      gameTimer.parentElement.classList.remove('time-ended');
      return;
    }
    const remaining = BL.getRemainingMs(match);
    BL.setText(gameTimer, BL.formatMs(remaining));
    if (remaining <= 0 || match.status === 'ended') {
      gameTimer.parentElement.classList.add('time-ended');
      BL.setText(gameTimer, '00:00');
    } else {
      gameTimer.parentElement.classList.remove('time-ended');
    }
  }

  function renderRatio(match) {
    const leftTeam = match.teams[0];
    const rightTeam = match.teams[1];
    const counts = BL.getCounts(match);
    const leftCount = counts[leftTeam] || 0;
    const rightCount = counts[rightTeam] || 0;
    const occupied = leftCount + rightCount;
    const leftPercent = occupied > 0 ? (leftCount / occupied) * 100 : 50;
    const rightPercent = occupied > 0 ? 100 - leftPercent : 50;

    BL.setText(leftRatioText, `${BL.getTeamName(leftTeam)} ${leftPercent.toFixed(1)}%`);
    BL.setText(rightRatioText, `${BL.getTeamName(rightTeam)} ${rightPercent.toFixed(1)}%`);
    BL.setText(neutralText, `점령 ${occupied}칸 · ${BL.getTeamName(leftTeam)} ${leftCount}칸 / ${BL.getTeamName(rightTeam)} ${rightCount}칸`);

    leftRatioBar.style.width = `${leftPercent}%`;
    neutralRatioBar.style.width = '0%';
    rightRatioBar.style.width = `${rightPercent}%`;
    leftRatioBar.style.backgroundColor = BL.getTeamColor(leftTeam);
    rightRatioBar.style.backgroundColor = BL.getTeamColor(rightTeam);
  }

  function renderPlayerStats(match) {
    if (!playerStats || !currentUser) return;
    const counts = BL.getCounts(match);
    const myCount = counts[Number(currentUser.classNo)] || 0;
    playerStats.textContent = '';

    const nameBlock = document.createElement('div');
    const nameLabel = document.createElement('span');
    nameLabel.textContent = '닉네임';
    const nameValue = document.createElement('strong');
    nameValue.textContent = currentUser.name;
    nameBlock.append(nameLabel, nameValue);

    const countBlock = document.createElement('div');
    const countLabel = document.createElement('span');
    countLabel.textContent = '내 반 점령 칸';
    const countValue = document.createElement('strong');
    countValue.textContent = `${myCount}칸`;
    countBlock.append(countLabel, countValue);

    playerStats.style.borderColor = BL.getTeamColor(currentUser.classNo);
    playerStats.append(nameBlock, countBlock);
  }

  function renderScores(match) {
    classScores.textContent = '';
    const counts = BL.getCounts(match);
    match.teams.forEach(function (team) {
      const count = counts[team] || 0;
      const score = count * 10;
      const card = document.createElement('div');
      card.className = 'score-card';

      const dot = document.createElement('span');
      dot.className = 'score-dot';
      dot.style.backgroundColor = BL.getTeamColor(team);

      const label = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = BL.getTeamName(team);
      const sub = document.createElement('span');
      sub.textContent = `${count}칸 점령`;
      label.append(strong, sub);

      const scoreText = document.createElement('strong');
      scoreText.textContent = `${score}점`;

      card.append(dot, label, scoreText);
      classScores.appendChild(card);
    });
  }

  function renderBoard(match) {
    boardEl.textContent = '';
    const ended = match.status === 'ended';
    for (let index = 0; index < BL.TOTAL_CELLS; index += 1) {
      const owner = match.board[index];
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = String(index);
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${BL.cellLabel(index)} 칸`);

      if (owner != null) {
        cell.style.backgroundColor = BL.getTeamColor(owner);
        cell.style.color = BL.getContrastText(BL.getTeamColor(owner));
        cell.title = `${BL.cellLabel(index)} · ${BL.getTeamName(owner)} 점령`;
      } else {
        cell.title = `${BL.cellLabel(index)} · 중립`;
      }

      if (currentUser) {
        const attackable = BL.canAttackCell(index, match, currentUser.classNo);
        const locked = BL.isCellLocked(match, index, currentUser.classNo);
        if (attackable && !ended) {
          cell.classList.add(Number(owner) && Number(owner) !== Number(currentUser.classNo) ? 'enemy-available' : 'available');
        }
        if (locked) {
          cell.classList.add('locked');
          const leftSec = Math.ceil((BL.getLockUntil(match, index, currentUser.classNo) - BL.now()) / 1000);
          cell.title += ` · ${leftSec}초 잠김`;
        }
      }

      if (ended) {
        cell.disabled = true;
      }

      cell.addEventListener('click', function () {
        handleCellClick(index);
      });
      boardEl.appendChild(cell);
    }
  }

  function renderBoardLocksOnly() {
    if (!currentUser || gamePage.classList.contains('hidden')) return;
    const match = BL.syncEnded(BL.cleanupLocks(BL.getMatch()));
    if (!match) return;
    BL.saveMatch(match);
    updateTimer(match);
    renderBoard(match);
  }

  function renderLogs(match) {
    logList.textContent = '';
    const current = BL.now();
    const liveLogs = (match.logs || []).filter(function (log) {
      return log.kind === 'capture' && current - Number(log.time) <= 5000;
    }).slice(0, 4);

    if (liveLogs.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-log';
      empty.textContent = '점령 로그 대기 중';
      logList.appendChild(empty);
      return;
    }

    liveLogs.forEach(function (log) {
      const color = BL.getTeamColor(log.team);
      const age = Math.max(0, current - Number(log.time));
      const item = document.createElement('li');
      item.className = 'live-log';
      item.style.backgroundColor = color;
      item.style.borderColor = color;
      item.style.color = BL.getContrastText(color);
      item.style.opacity = String(Math.max(0.05, 1 - age / 5000));

      const time = document.createElement('time');
      time.textContent = BL.formatTime(log.time);
      const message = document.createElement('span');
      message.textContent = log.message;
      item.append(time, message);
      logList.appendChild(item);
    });
  }

  function handleCellClick(index) {
    const match = BL.syncEnded(BL.cleanupLocks(BL.getMatch()));
    if (!match || !currentUser) {
      BL.showToast('경기 정보를 찾을 수 없습니다.');
      return;
    }
    if (match.status === 'ended') {
      BL.showToast('경기가 종료되었습니다.');
      renderGame();
      return;
    }
    if (!match.teams.includes(Number(currentUser.classNo))) {
      BL.showToast('현재 경기 참가 반이 아닙니다.');
      return;
    }
    if (BL.isCellLocked(match, index, currentUser.classNo)) {
      const leftSec = Math.ceil((BL.getLockUntil(match, index, currentUser.classNo) - BL.now()) / 1000);
      BL.showToast(`오답 잠금 중입니다. ${leftSec}초 뒤 다시 시도하세요.`);
      return;
    }
    if (!BL.canAttackCell(index, match, currentUser.classNo)) {
      BL.showToast(BL.getAttackReason(index, match, currentUser.classNo));
      return;
    }
    openQuestionModal(index, match);
  }

  function openQuestionModal(index, match) {
    activeCellIndex = index;
    activeProblem = BL.pickProblem(index);
    selectedChoiceIndex = null;
    const owner = match.board[index];
    const attackText = owner == null ? '중립 칸 점령' : `${BL.getTeamName(owner)} 칸 공격`;
    const levelLabel = activeProblem.difficulty === 'hard' ? '어려움' : activeProblem.difficulty === 'normal' ? '보통' : '쉬움';

    BL.setText(questionMeta, `${BL.cellLabel(index)} · ${attackText} · ${activeProblem.subject} · ${levelLabel}`);
    BL.setText(questionTitle, `문제 ${activeProblem.id}`);
    BL.setText(questionText, activeProblem.question);
    renderChoices(activeProblem);
    questionModal.classList.remove('hidden');
  }

  function renderChoices(problem) {
    choiceList.textContent = '';
    const marks = ['①', '②', '③', '④', '⑤'];
    problem.choices.forEach(function (choice, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.dataset.choiceIndex = String(index);

      const number = document.createElement('span');
      number.className = 'choice-index';
      number.textContent = marks[index] || `${index + 1}`;

      const text = document.createElement('span');
      text.className = 'choice-text';
      text.textContent = choice;

      button.append(number, text);
      button.addEventListener('click', function () {
        selectedChoiceIndex = index;
        Array.from(choiceList.children).forEach(function (child) {
          child.classList.remove('selected');
        });
        button.classList.add('selected');
      });
      choiceList.appendChild(button);
    });
  }

  function closeQuestionModal() {
    questionModal.classList.add('hidden');
    activeProblem = null;
    activeCellIndex = null;
    selectedChoiceIndex = null;
  }

  function submitAnswer() {
    if (!activeProblem || activeCellIndex == null || !currentUser) return;
    if (selectedChoiceIndex == null) {
      BL.showToast('선택지를 먼저 고르세요.');
      return;
    }

    const match = BL.syncEnded(BL.cleanupLocks(BL.getMatch()));
    if (!match || match.status === 'ended') {
      BL.showToast('경기가 종료되었습니다.');
      closeQuestionModal();
      renderGame();
      return;
    }
    if (!BL.canAttackCell(activeCellIndex, match, currentUser.classNo)) {
      BL.showToast('이미 점령 조건이 바뀌었습니다. 다시 선택하세요.');
      closeQuestionModal();
      renderGame();
      return;
    }
    if (BL.isCellLocked(match, activeCellIndex, currentUser.classNo)) {
      BL.showToast('해당 칸은 아직 잠금 중입니다.');
      closeQuestionModal();
      renderGame();
      return;
    }

    const cellName = BL.cellLabel(activeCellIndex);
    const teamName = BL.getTeamName(currentUser.classNo);
    const wasOwner = match.board[activeCellIndex];
    const correct = selectedChoiceIndex === activeProblem.answer;

    if (correct) {
      match.board[activeCellIndex] = Number(currentUser.classNo);
      if (wasOwner == null) {
        BL.addLog(match, `${currentUser.name} · ${cellName} 점령`, currentUser.classNo, 'capture');
      } else {
        BL.addLog(match, `${currentUser.name} · ${cellName} 탈환`, currentUser.classNo, 'capture');
      }
      if (match.logs && match.logs[0]) {
        match.logs[0].player = currentUser.name;
        match.logs[0].cell = cellName;
      }
      BL.saveMatch(match);
      closeQuestionModal();
      renderGame();
      BL.showToast('정답입니다. 칸을 점령했습니다.');
      return;
    }

    BL.lockCellForTeam(match, activeCellIndex, currentUser.classNo);
    BL.addLog(match, `${teamName}이 ${cellName} 칸에서 오답 처리되어 30초 잠금되었습니다.`, currentUser.classNo);
    BL.saveMatch(match);
    closeQuestionModal();
    renderGame();
    BL.showToast('오답입니다. 이 반은 해당 칸을 30초 동안 다시 풀 수 없습니다.');
  }

  init();
})();
