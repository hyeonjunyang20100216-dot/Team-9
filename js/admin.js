(function () {
  'use strict';

  const BL = window.BeneduLand;

  const adminLogin = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPassword = document.getElementById('adminPassword');
  const matchForm = document.getElementById('matchForm');
  const teamASelect = document.getElementById('teamASelect');
  const teamBSelect = document.getElementById('teamBSelect');
  const forceTimerBtn = document.getElementById('forceTimerBtn');
  const endMatchBtn = document.getElementById('endMatchBtn');
  const clearMatchBtn = document.getElementById('clearMatchBtn');

  const adminStatusText = document.getElementById('adminStatusText');
  const adminPair = document.getElementById('adminPair');
  const adminTimer = document.getElementById('adminTimer');
  const adminLeftCount = document.getElementById('adminLeftCount');
  const adminRightCount = document.getElementById('adminRightCount');
  const adminNeutralCount = document.getElementById('adminNeutralCount');
  const adminLeftBar = document.getElementById('adminLeftBar');
  const adminNeutralBar = document.getElementById('adminNeutralBar');
  const adminRightBar = document.getElementById('adminRightBar');
  const adminLogList = document.getElementById('adminLogList');

  let adminTimerInterval = null;

  function init() {
    bindEvents();
    if (BL.isAdminAuthed()) {
      showPanel();
    } else {
      showLogin();
    }
  }

  function bindEvents() {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    matchForm.addEventListener('submit', handleCreateMatch);
    forceTimerBtn.addEventListener('click', handleForceTimer);
    endMatchBtn.addEventListener('click', handleEndMatch);
    clearMatchBtn.addEventListener('click', handleClearMatch);
    window.addEventListener('storage', function (event) {
      if (event.key === BL.STORAGE_KEY) renderAdmin();
    });
  }

  function showLogin() {
    adminLogin.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    stopAdminTimer();
  }

  function showPanel() {
    adminLogin.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    startAdminTimer();
    renderAdmin();
  }

  function handleAdminLogin(event) {
    event.preventDefault();
    if (adminPassword.value === '1111') {
      BL.setAdminAuthed(true);
      adminPassword.value = '';
      showPanel();
      BL.showToast('어드민 입장 완료');
    } else {
      BL.showToast('비밀번호가 틀렸습니다.');
    }
  }

  function handleCreateMatch(event) {
    event.preventDefault();
    try {
      const match = BL.createMatch(Number(teamASelect.value), Number(teamBSelect.value));
      BL.saveMatch(match);
      renderAdmin();
      BL.showToast('경기를 시작했습니다. 첫 학생 입장 시 타이머가 시작됩니다.');
    } catch (error) {
      BL.showToast(error.message || '경기 생성에 실패했습니다.');
    }
  }

  function handleForceTimer() {
    const match = BL.getMatch();
    if (!match) {
      BL.showToast('먼저 경기를 시작하세요.');
      return;
    }
    if (match.status === 'ended') {
      BL.showToast('이미 종료된 경기입니다. 새 경기를 시작하세요.');
      return;
    }
    BL.forceStartTimer(match);
    renderAdmin();
    BL.showToast('20분 타이머를 시작했습니다.');
  }

  function handleEndMatch() {
    const match = BL.getMatch();
    if (!match) {
      BL.showToast('종료할 경기가 없습니다.');
      return;
    }
    match.status = 'ended';
    BL.addLog(match, '어드민이 경기를 종료했습니다.', null);
    BL.saveMatch(match);
    renderAdmin();
    BL.showToast('경기를 종료했습니다.');
  }

  function handleClearMatch() {
    const ok = window.confirm('현재 경기판과 로그를 모두 초기화할까요?');
    if (!ok) return;
    BL.clearMatch();
    renderAdmin();
    BL.showToast('경기 정보를 초기화했습니다.');
  }

  function startAdminTimer() {
    stopAdminTimer();
    adminTimerInterval = window.setInterval(renderAdmin, 1000);
  }

  function stopAdminTimer() {
    if (adminTimerInterval) window.clearInterval(adminTimerInterval);
    adminTimerInterval = null;
  }

  function renderAdmin() {
    let match = BL.syncEnded(BL.cleanupLocks(BL.getMatch()));
    if (match) BL.saveMatch(match);

    if (!match) {
      BL.setText(adminStatusText, '없음');
      BL.setText(adminPair, '없음');
      BL.setText(adminTimer, '-');
      BL.setText(adminLeftCount, '0칸');
      BL.setText(adminRightCount, '0칸');
      BL.setText(adminNeutralCount, '400칸');
      adminLeftBar.style.width = '50%';
      adminNeutralBar.style.width = '0%';
      adminRightBar.style.width = '50%';
      adminLeftBar.style.backgroundColor = '#151515';
      adminRightBar.style.backgroundColor = '#151515';
      renderAdminLogs(null);
      return;
    }

    const leftTeam = match.teams[0];
    const rightTeam = match.teams[1];
    const counts = BL.getCounts(match);
    const leftCount = counts[leftTeam] || 0;
    const rightCount = counts[rightTeam] || 0;
    const neutralCount = counts.neutral || 0;
    const occupied = leftCount + rightCount;
    const leftPercent = occupied > 0 ? (leftCount / occupied) * 100 : 50;
    const rightPercent = occupied > 0 ? 100 - leftPercent : 50;

    BL.setText(adminStatusText, getStatusLabel(match.status));
    BL.setText(adminPair, `${BL.getTeamName(leftTeam)} 왼쪽 vs ${BL.getTeamName(rightTeam)} 오른쪽`);
    BL.setText(adminTimer, match.status === 'waiting' ? '첫 입장 대기' : BL.formatMs(BL.getRemainingMs(match)));
    BL.setText(adminLeftCount, `${BL.getTeamName(leftTeam)} ${leftCount}칸 · ${leftPercent.toFixed(1)}%`);
    BL.setText(adminRightCount, `${BL.getTeamName(rightTeam)} ${rightCount}칸 · ${rightPercent.toFixed(1)}%`);
    BL.setText(adminNeutralCount, `${neutralCount}칸`);

    adminLeftBar.style.width = `${leftPercent}%`;
    adminNeutralBar.style.width = '0%';
    adminRightBar.style.width = `${rightPercent}%`;
    adminLeftBar.style.backgroundColor = BL.getTeamColor(leftTeam);
    adminRightBar.style.backgroundColor = BL.getTeamColor(rightTeam);

    renderAdminLogs(match);
  }

  function getStatusLabel(status) {
    if (status === 'waiting') return '입장 대기';
    if (status === 'running') return '진행 중';
    if (status === 'ended') return '종료';
    return '알 수 없음';
  }

  function renderAdminLogs(match) {
    adminLogList.textContent = '';
    if (!match || !match.logs || match.logs.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = '아직 기록이 없습니다.';
      adminLogList.appendChild(empty);
      return;
    }
    match.logs.slice(0, 30).forEach(function (log) {
      const item = document.createElement('li');
      if (log.team) item.style.borderLeft = `6px solid ${BL.getTeamColor(log.team)}`;
      const time = document.createElement('time');
      time.textContent = BL.formatTime(log.time);
      const text = document.createElement('span');
      text.textContent = log.message;
      item.append(time, text);
      adminLogList.appendChild(item);
    });
  }

  init();
})();
