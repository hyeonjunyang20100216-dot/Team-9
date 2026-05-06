(function () {
  'use strict';

  const STORAGE_KEY = 'benedu-land-final-match';
  const USER_KEY = 'benedu-land-final-user';
  const ADMIN_KEY = 'benedu-land-final-admin-ok';
  const BOARD_SIZE = 20;
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
  const GAME_DURATION_MS = 20 * 60 * 1000;
  const LOCK_DURATION_MS = 30 * 1000;

  const TEAM_COLORS = {
    1: '#C30D23',
    2: '#037F00',
    3: '#151000',
    4: '#131500',
    5: '#1A0055',
    6: '#19004A'
  };

  const TEAM_LABELS = {
    1: '1반',
    2: '2반',
    3: '3반',
    4: '4반',
    5: '5반',
    6: '6반'
  };

  const PROBLEMS = {
    easy: [
      {
        id: 'E-001',
        subject: '수학',
        level: '바깥쪽',
        question: '√20 + √5를 간단히 하면?',
        choices: ['3√5', '2√5', '4√5', '5√5', '6√5'],
        answer: 0
      },
      {
        id: 'E-002',
        subject: '수학',
        level: '바깥쪽',
        question: '일차함수 y = 2x + 3의 그래프에서 기울기와 y절편의 곱은?',
        choices: ['4', '8', '10', '6', '12'],
        answer: 3
      },
      {
        id: 'E-003',
        subject: '수학',
        level: '바깥쪽',
        question: 'x/2 + 7 = 2x - 8의 해는?',
        choices: ['2', '4', '6', '8', '10'],
        answer: 4
      },
      {
        id: 'E-004',
        subject: '영어',
        level: '바깥쪽',
        question: '안내 방송의 목적을 묻는 문제에서 가장 먼저 확인해야 할 것은?',
        choices: ['마지막 단어의 철자', '선택지의 길이', '말하는 사람의 전체 의도', '배경음의 크기', '문제 번호의 위치'],
        answer: 2
      },
      {
        id: 'E-005',
        subject: '국어',
        level: '바깥쪽',
        question: '발표자가 청중에게 질문을 던지는 방식의 주된 효과로 적절한 것은?',
        choices: ['청중의 반응을 유도한다', '글의 문단 수를 줄인다', '주제를 감춘다', '근거를 삭제한다', '발표 순서를 없앤다'],
        answer: 0
      },
      {
        id: 'E-006',
        subject: '영어',
        level: '바깥쪽',
        question: '다음 중 약속 시간을 정할 때 자연스러운 응답은?',
        choices: ['I lost my pencil.', 'Sounds good. What time?', 'The wall is blue.', 'It is too heavy to fly.', 'No, I do not own a museum.'],
        answer: 1
      },
      {
        id: 'E-007',
        subject: '국어',
        level: '바깥쪽',
        question: '토론에서 상대 주장을 반박할 때 가장 필요한 것은?',
        choices: ['목소리 크기만 키우기', '상대 이름 반복하기', '문제 번호 바꾸기', '주장과 관련된 근거', '선택지 지우기'],
        answer: 3
      },
      {
        id: 'E-008',
        subject: '수학',
        level: '바깥쪽',
        question: '두 점 (1, -1), (2, 1)을 지나는 직선의 기울기는?',
        choices: ['-2', '-1', '0', '1', '2'],
        answer: 4
      }
    ],
    normal: [
      {
        id: 'N-001',
        subject: '수학',
        level: '중간',
        question: '두 일차방정식 x - 2y = 7, 2x + y = -1의 해를 (a, b)라 할 때 a + b의 값은?',
        choices: ['-2', '-6', '-5', '-4', '-3'],
        answer: 0
      },
      {
        id: 'N-002',
        subject: '수학',
        level: '중간',
        question: '서로 다른 두 주사위를 던질 때 눈의 차가 2 또는 4가 되는 경우의 수는?',
        choices: ['8', '10', '14', '16', '12'],
        answer: 4
      },
      {
        id: 'N-003',
        subject: '수학',
        level: '중간',
        question: '직각삼각형에서 두 직각변의 길이가 3, 2이면 빗변을 한 변으로 하는 정사각형의 넓이는?',
        choices: ['11', '12', '13', '14', '15'],
        answer: 2
      },
      {
        id: 'N-004',
        subject: '국어',
        level: '중간',
        question: '자료를 활용한 발표에서 자료와 설명이 맞는지 판단할 때 가장 중요한 것은?',
        choices: ['자료의 색이 화려한지', '자료가 설명의 근거로 쓰였는지', '발표자가 빨리 읽는지', '선택지가 긴지', '문장 부호가 많은지'],
        answer: 1
      },
      {
        id: 'N-005',
        subject: '영어',
        level: '중간',
        question: '표를 보며 물건을 고르는 듣기 문제에서 핵심적으로 비교해야 하는 것은?',
        choices: ['조건에 맞는 항목', '알파벳 순서', '상품명의 글자 수', '가격표의 색', '선택지 번호 모양'],
        answer: 0
      },
      {
        id: 'N-006',
        subject: '국어',
        level: '중간',
        question: '주장하는 글에서 독자를 설득하기 위해 필요한 요소로 가장 적절한 것은?',
        choices: ['뜻이 모호한 결론', '근거 없는 비난', '주제와 무관한 사례', '명확한 주장과 타당한 근거', '문단 순서의 무작위 배열'],
        answer: 3
      },
      {
        id: 'N-007',
        subject: '수학',
        level: '중간',
        question: '다항식 (x + a)(x - 3)을 전개한 식이 x² + bx + 6일 때 a의 값은?',
        choices: ['-3', '-2', '2', '3', '6'],
        answer: 1
      },
      {
        id: 'N-008',
        subject: '영어',
        level: '중간',
        question: '상대의 조언에 동의하며 앞으로 그렇게 하겠다는 응답으로 가장 자연스러운 것은?',
        choices: ['I have no classroom.', 'The ticket is not red.', 'Where is the mountain?', 'This table has five legs.', 'Right. I will try that.'],
        answer: 4
      }
    ],
    hard: [
      {
        id: 'H-001',
        subject: '수학',
        level: '중심부',
        question: '이차방정식 x² - 3x - 1 = 0의 두 근 중 양수인 근은?',
        choices: ['(3 + √11) / 2', '(3 + √13) / 2', '(6 + √11) / 2', '(6 + √13) / 2', '(6 + √15) / 2'],
        answer: 1
      },
      {
        id: 'H-002',
        subject: '수학',
        level: '중심부',
        question: '세 모서리의 길이가 x - 1, x + 1, 2x + 1인 직육면체의 겉넓이는? 단, x > 1',
        choices: ['8x² + 4x - 2', '8x² + 6x + 2', '10x² + 6x + 2', '10x² + 4x - 2', '12x² + 8x - 2'],
        answer: 3
      },
      {
        id: 'H-003',
        subject: '수학',
        level: '중심부',
        question: '연립방정식 x + 2y = 1, 2x - 3y = 9의 해가 x = a, y = b일 때 a + b의 값은?',
        choices: ['-2', '-1', '2', '0', '1'],
        answer: 2
      },
      {
        id: 'H-004',
        subject: '국어',
        level: '중심부',
        question: '발표를 듣고 자신의 경험과 연결하여 대상의 가치를 새롭게 인식한 반응으로 가장 적절한 것은?',
        choices: ['발표자의 발음만 평가했다', '자료의 색상만 비교했다', '선택지 번호만 기억했다', '주제와 상관없는 감상을 썼다', '경험을 근거로 발표 소재의 의미를 확장해 이해했다'],
        answer: 4
      },
      {
        id: 'H-005',
        subject: '국어',
        level: '중심부',
        question: '토론 내용을 바탕으로 글을 쓸 때, 상대 주장까지 고려한 반박을 넣는 이유로 가장 적절한 것은?',
        choices: ['주장의 설득력을 높이기 위해서', '문단을 모두 없애기 위해서', '주제를 숨기기 위해서', '근거를 약하게 만들기 위해서', '독자의 이해를 방해하기 위해서'],
        answer: 0
      },
      {
        id: 'H-006',
        subject: '영어',
        level: '중심부',
        question: '듣기에서 여자의 마지막 말에 대한 남자의 응답을 고를 때 가장 타당한 풀이 순서는?',
        choices: ['선택지 길이 비교 → 가장 긴 문장 선택', '상황 파악 → 마지막 말 의도 확인 → 응답 선택', '첫 단어만 듣고 선택', '숫자가 있는 선택지만 고르기', '주제와 무관한 표현 찾기'],
        answer: 1
      },
      {
        id: 'H-007',
        subject: '수학',
        level: '중심부',
        question: '두 점 (1, -1), (2, 1)을 지나는 직선의 y절편은?',
        choices: ['-2', '-1', '-3', '0', '1'],
        answer: 2
      },
      {
        id: 'H-008',
        subject: '영어',
        level: '중심부',
        question: '안내문 일치·불일치 문제를 풀 때 가장 먼저 해야 할 일은?',
        choices: ['모르는 단어 하나만 외운다', '제목만 보고 찍는다', '선택지 번호를 무작위로 고른다', '선택지의 세부 정보를 본문 정보와 대조한다', '문제의 글꼴을 비교한다'],
        answer: 3
      }
    ]
  };

  function now() {
    return Date.now();
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(text, fallback) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return fallback;
    }
  }

  function blankBoard() {
    return Array.from({ length: TOTAL_CELLS }, () => null);
  }

  function normalizeTeams(a, b) {
    const first = Number(a);
    const second = Number(b);
    if (!Number.isInteger(first) || !Number.isInteger(second) || first < 1 || first > 6 || second < 1 || second > 6 || first === second) {
      return null;
    }
    return [Math.min(first, second), Math.max(first, second)];
  }

  function createMatch(teamA, teamB) {
    const teams = normalizeTeams(teamA, teamB);
    if (!teams) {
      throw new Error('서로 다른 두 반을 선택해야 합니다.');
    }
    const created = now();
    return {
      version: 4,
      status: 'waiting',
      teams: teams,
      createdAt: created,
      startedAt: null,
      endsAt: null,
      durationMs: GAME_DURATION_MS,
      board: blankBoard(),
      locks: {},
      logs: [makeLog('어드민이 경기를 열었습니다. 첫 학생 입장 시 20분 타이머가 시작됩니다.', null, created)]
    };
  }

  function makeLog(message, team, time, kind) {
    return {
      id: String(time || now()) + '-' + Math.random().toString(16).slice(2),
      time: time || now(),
      message: String(message),
      team: team == null ? null : Number(team),
      kind: kind || 'system'
    };
  }

  function addLog(match, message, team, kind) {
    const copy = match;
    if (!Array.isArray(copy.logs)) {
      copy.logs = [];
    }
    copy.logs.unshift(makeLog(message, team, undefined, kind));
    copy.logs = copy.logs.slice(0, 100);
    return copy;
  }

  function getMatch() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY), null);
    if (!parsed || parsed.version !== 4 || !Array.isArray(parsed.board) || parsed.board.length !== TOTAL_CELLS) {
      return null;
    }
    if (!Array.isArray(parsed.logs)) parsed.logs = [];
    if (!parsed.locks || typeof parsed.locks !== 'object') parsed.locks = {};
    return parsed;
  }

  function saveMatch(match) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
  }

  function clearMatch() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getUser() {
    const parsed = safeParse(localStorage.getItem(USER_KEY), null);
    if (!parsed || !parsed.name || !parsed.classNo) return null;
    return { name: String(parsed.name), classNo: Number(parsed.classNo) };
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify({ name: String(user.name), classNo: Number(user.classNo) }));
  }

  function clearUser() {
    localStorage.removeItem(USER_KEY);
  }

  function isAdminAuthed() {
    return sessionStorage.getItem(ADMIN_KEY) === '1';
  }

  function setAdminAuthed(value) {
    if (value) sessionStorage.setItem(ADMIN_KEY, '1');
    else sessionStorage.removeItem(ADMIN_KEY);
  }

  function getTeamName(team) {
    return TEAM_LABELS[Number(team)] || `${team}반`;
  }

  function getTeamColor(team) {
    return TEAM_COLORS[Number(team)] || '#151515';
  }

  function getContrastText(hex) {
    const clean = String(hex).replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? '#151515' : '#ffffff';
  }

  function indexToPoint(index) {
    const safe = Number(index);
    return { row: Math.floor(safe / BOARD_SIZE), col: safe % BOARD_SIZE };
  }

  function pointToIndex(row, col) {
    return row * BOARD_SIZE + col;
  }

  function isInside(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  function getSideForTeam(match, team) {
    if (!match || !Array.isArray(match.teams)) return null;
    const left = Number(match.teams[0]);
    const right = Number(match.teams[1]);
    if (Number(team) === left) return 'left';
    if (Number(team) === right) return 'right';
    return null;
  }

  function isOwnHomeEdge(index, match, team) {
    const point = indexToPoint(index);
    const side = getSideForTeam(match, team);
    if (side === 'left') return point.col === 0;
    if (side === 'right') return point.col === BOARD_SIZE - 1;
    return false;
  }

  function hasAdjacentOwnCell(index, match, team) {
    const point = indexToPoint(index);
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    return directions.some(([dr, dc]) => {
      const nr = point.row + dr;
      const nc = point.col + dc;
      if (!isInside(nr, nc)) return false;
      return Number(match.board[pointToIndex(nr, nc)]) === Number(team);
    });
  }

  function canAttackCell(index, match, team) {
    if (!match || !Array.isArray(match.board)) return false;
    const owner = match.board[index];
    if (Number(owner) === Number(team)) return false;
    if (isOwnHomeEdge(index, match, team)) return true;
    return hasAdjacentOwnCell(index, match, team);
  }

  function getAttackReason(index, match, team) {
    const side = getSideForTeam(match, team);
    if (!side) return '현재 경기 참가 반이 아닙니다.';
    if (Number(match.board[index]) === Number(team)) return '이미 우리 반이 점령한 칸입니다.';
    return '아직 공격할 수 없는 칸입니다.';
  }

  function getCellKey(index) {
    const point = indexToPoint(index);
    return `${point.row}-${point.col}`;
  }

  function getLockUntil(match, index, team) {
    const key = getCellKey(index);
    const lock = match && match.locks ? match.locks[key] : null;
    if (!lock) return 0;
    return Number(lock[Number(team)] || 0);
  }

  function isCellLocked(match, index, team) {
    return getLockUntil(match, index, team) > now();
  }

  function lockCellForTeam(match, index, team) {
    const key = getCellKey(index);
    if (!match.locks || typeof match.locks !== 'object') match.locks = {};
    if (!match.locks[key]) match.locks[key] = {};
    match.locks[key][Number(team)] = now() + LOCK_DURATION_MS;
    return match;
  }

  function cleanupLocks(match) {
    if (!match || !match.locks) return match;
    const current = now();
    Object.keys(match.locks).forEach((cellKey) => {
      Object.keys(match.locks[cellKey]).forEach((team) => {
        if (Number(match.locks[cellKey][team]) <= current) {
          delete match.locks[cellKey][team];
        }
      });
      if (Object.keys(match.locks[cellKey]).length === 0) {
        delete match.locks[cellKey];
      }
    });
    return match;
  }

  function startTimerIfNeeded(match) {
    if (!match) return match;
    if (match.status === 'waiting') {
      const started = now();
      match.status = 'running';
      match.startedAt = started;
      match.endsAt = started + (match.durationMs || GAME_DURATION_MS);
      addLog(match, '첫 학생이 입장했습니다. 20분 타이머가 시작되었습니다.', null);
      saveMatch(match);
    }
    return match;
  }

  function forceStartTimer(match) {
    if (!match) return null;
    const started = now();
    match.status = 'running';
    match.startedAt = started;
    match.endsAt = started + (match.durationMs || GAME_DURATION_MS);
    addLog(match, '어드민이 타이머를 강제로 시작했습니다.', null);
    saveMatch(match);
    return match;
  }

  function syncEnded(match) {
    if (!match) return null;
    if (match.status === 'running' && Number(match.endsAt) <= now()) {
      match.status = 'ended';
      addLog(match, '20분이 지나 경기가 종료되었습니다.', null);
      saveMatch(match);
    }
    return match;
  }

  function getRemainingMs(match) {
    if (!match) return 0;
    if (match.status === 'waiting') return match.durationMs || GAME_DURATION_MS;
    if (!match.endsAt) return 0;
    return Math.max(0, Number(match.endsAt) - now());
  }

  function formatMs(ms) {
    const safe = Math.max(0, Number(ms) || 0);
    const totalSeconds = Math.ceil(safe / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function getDifficulty(index) {
    const { row, col } = indexToPoint(index);
    const center = (BOARD_SIZE - 1) / 2;
    const distance = Math.max(Math.abs(row - center), Math.abs(col - center));
    if (distance <= 3.5) return 'hard';
    if (distance <= 7.5) return 'normal';
    return 'easy';
  }

  function pickProblem(index) {
    const difficulty = getDifficulty(index);
    const list = PROBLEMS[difficulty] || PROBLEMS.easy;
    const chosen = list[Math.abs(index * 13 + difficulty.length * 17) % list.length];
    return deepClone({ ...chosen, difficulty });
  }

  function getCounts(match) {
    const counts = { neutral: 0 };
    if (!match || !Array.isArray(match.board)) {
      return { neutral: TOTAL_CELLS };
    }
    match.board.forEach((owner) => {
      if (owner == null) {
        counts.neutral += 1;
      } else {
        const key = Number(owner);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }

  function getPercent(count) {
    return Math.max(0, Math.min(100, (Number(count) || 0) / TOTAL_CELLS * 100));
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  function cellLabel(index) {
    const { row, col } = indexToPoint(index);
    return `${String.fromCharCode(65 + row)}-${col + 1}`;
  }

  window.BeneduLand = {
    STORAGE_KEY,
    USER_KEY,
    BOARD_SIZE,
    TOTAL_CELLS,
    GAME_DURATION_MS,
    LOCK_DURATION_MS,
    TEAM_COLORS,
    TEAM_LABELS,
    PROBLEMS,
    now,
    createMatch,
    getMatch,
    saveMatch,
    clearMatch,
    getUser,
    saveUser,
    clearUser,
    isAdminAuthed,
    setAdminAuthed,
    getTeamName,
    getTeamColor,
    getContrastText,
    indexToPoint,
    pointToIndex,
    getSideForTeam,
    isOwnHomeEdge,
    hasAdjacentOwnCell,
    canAttackCell,
    getAttackReason,
    getCellKey,
    getLockUntil,
    isCellLocked,
    lockCellForTeam,
    cleanupLocks,
    startTimerIfNeeded,
    forceStartTimer,
    syncEnded,
    getRemainingMs,
    formatMs,
    getDifficulty,
    pickProblem,
    getCounts,
    getPercent,
    formatTime,
    addLog,
    setText,
    showToast,
    cellLabel
  };
})();
