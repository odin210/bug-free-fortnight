import { StorageService } from './services/storage.js';
import { StatsCalculator } from './services/stats.js';
import { renderHeader, renderNavigation } from './components/Navigation.js';
import { renderHomeView } from './components/HomeView.js';
import { renderNewRoundModal } from './components/NewRoundModal.js';
import { renderRoundLiveView } from './components/RoundLiveView.js';
import { renderScorecardModal } from './components/ScorecardModal.js';
import { renderRoundSummaryView } from './components/RoundSummaryView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderStatsView } from './components/StatsView.js';
import { renderCourseManagerView, renderCourseEditModal } from './components/CourseManagerView.js';

// 글로벌 앱 상태
const state = {
  currentView: 'home', // 'home' | 'liveRound' | 'newRoundSetup' | 'history' | 'stats' | 'courses' | 'summary'
  courses: [],
  rounds: [],
  activeRound: null,
  currentHoleIndex: 0,
  isScorecardModalOpen: false,
  selectedRoundDetail: null,
  summaryRound: null,
  newRoundDraft: null,
  // 통계 뷰 상태
  statsActiveTab: 'courses',
  statsSelectedCourseId: null,
  statsSelectedSubCourseId: null,
  // 골프장 관리 상태
  courseSearchQuery: '',
  editingCourse: null,
  isCourseEditModalOpen: false,
  historyCourseFilter: 'all'
};

// 메인 렌더 함수
function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  let bodyHtml = '';

  switch (state.currentView) {
    case 'home':
      bodyHtml = renderHomeView(state);
      break;
    case 'newRoundSetup':
      bodyHtml = renderNewRoundModal(state);
      break;
    case 'liveRound':
      bodyHtml = renderRoundLiveView(state);
      break;
    case 'summary':
      bodyHtml = renderRoundSummaryView(state);
      break;
    case 'history':
      bodyHtml = renderHistoryView(state);
      break;
    case 'stats':
      bodyHtml = renderStatsView(state);
      break;
    case 'courses':
      bodyHtml = renderCourseManagerView(state);
      break;
    default:
      bodyHtml = renderHomeView(state);
  }

  // 모달 렌더링
  let modalsHtml = '';
  if (state.isScorecardModalOpen) {
    modalsHtml += renderScorecardModal(state);
  }
  if (state.isCourseEditModalOpen) {
    modalsHtml += renderCourseEditModal(state);
  }

  appContainer.innerHTML = `
    ${renderHeader(state)}
    <main class="flex-1 w-full overflow-y-auto">
      ${bodyHtml}
    </main>
    ${renderNavigation(state)}
    ${modalsHtml}
  `;
}

// 헬퍼: 현재 홀 자동 보정
function updateActiveHoleInRound(holeMutator) {
  if (!state.activeRound) return;
  const hIdx = state.currentHoleIndex;
  const currentHole = state.activeRound.holes[hIdx];
  if (!currentHole) return;

  holeMutator(currentHole);

  // 스코어 & 퍼트에 따른 GIR 자동 계산 보정 (GIR이 명시적으로 고정되지 않은 경우)
  const par = currentHole.par || 4;
  const score = currentHole.score;
  const putts = currentHole.putts !== undefined ? currentHole.putts : 2;
  if (currentHole.girAuto !== false) {
    currentHole.gir = ((score - putts) <= (par - 2));
  }

  // 총점 재계산
  state.activeRound.totalScore = state.activeRound.holes.reduce((sum, h) => sum + (h.score || 0), 0);
  const totalPar = state.activeRound.holes.reduce((sum, h) => sum + (h.par || 4), 0);
  state.activeRound.totalPar = totalPar;
  state.activeRound.overPar = state.activeRound.totalScore - totalPar;

  // 임시 저장
  StorageService.saveActiveRound(state.activeRound);
  renderApp();
}

// 글로벌 액션 정의 (HTML 인라인 이벤트 핸들러 바인딩)
window.appActions = {
  // 네비게이션
  navigate: (viewName) => {
    state.currentView = viewName;
    if (viewName === 'stats') {
      if (!state.statsSelectedCourseId && state.courses.length > 0) {
        state.statsSelectedCourseId = state.courses[0].id;
        state.statsSelectedSubCourseId = state.courses[0].subCourses[0]?.id;
      }
    }
    renderApp();
    window.scrollTo(0, 0);
  },

  // 새 라운드 설정
  openNewRoundModal: () => {
    const courses = state.courses;
    const defaultCourse = courses[0];
    state.newRoundDraft = {
      courseId: defaultCourse ? defaultCourse.id : '',
      outCourseId: defaultCourse?.subCourses[0]?.id || '',
      inCourseId: defaultCourse?.subCourses[1]?.id || defaultCourse?.subCourses[0]?.id || '',
      teeBox: '화이트',
      date: new Date().toISOString().slice(0, 10),
      weather: '맑음 ☀️',
      memo: ''
    };
    state.currentView = 'newRoundSetup';
    renderApp();
  },

  onSelectCourseInDraft: (courseId) => {
    const course = state.courses.find(c => c.id === courseId);
    if (course && course.subCourses && course.subCourses.length > 0) {
      state.newRoundDraft.courseId = courseId;
      state.newRoundDraft.outCourseId = course.subCourses[0].id;
      state.newRoundDraft.inCourseId = course.subCourses[1]?.id || course.subCourses[0].id;
    }
    renderApp();
  },

  updateNewRoundDraft: (patch) => {
    state.newRoundDraft = { ...state.newRoundDraft, ...patch };
    renderApp();
  },

  startRoundFromDraft: () => {
    const draft = state.newRoundDraft;
    const course = state.courses.find(c => c.id === draft.courseId) || state.courses[0];
    if (!course) {
      alert('골프장을 선택해주세요.');
      return;
    }

    const outSub = course.subCourses.find(sc => sc.id === draft.outCourseId) || course.subCourses[0];
    const inSub = course.subCourses.find(sc => sc.id === draft.inCourseId) || course.subCourses[1] || course.subCourses[0];

    // 18홀 구성 (전반 9홀 + 후반 9홀)
    const holes = [];

    // 전반 9홀
    outSub.holes.slice(0, 9).forEach((h, idx) => {
      holes.push({
        holeIndex: idx,
        subCourseId: outSub.id,
        subCourseName: outSub.name,
        holeNumber: h.holeNumber || (idx + 1),
        par: h.par || 4,
        handicap: h.handicap || (idx + 1),
        distance: h.distance || 350,
        score: h.par || 4, // 초기값: Par
        putts: 2,          // 초기값: 2펏
        fairway: (h.par === 3 ? 'none' : 'center'),
        gir: true,
        girAuto: true,
        bunkerCount: 0,
        penaltyCount: 0,
        memo: ''
      });
    });

    // 후반 9홀
    inSub.holes.slice(0, 9).forEach((h, idx) => {
      holes.push({
        holeIndex: idx + 9,
        subCourseId: inSub.id,
        subCourseName: inSub.name,
        holeNumber: h.holeNumber || (idx + 1),
        par: h.par || 4,
        handicap: h.handicap || (idx + 1),
        distance: h.distance || 350,
        score: h.par || 4,
        putts: 2,
        fairway: (h.par === 3 ? 'none' : 'center'),
        gir: true,
        girAuto: true,
        bunkerCount: 0,
        penaltyCount: 0,
        memo: ''
      });
    });

    const newRound = {
      id: `round-${Date.now()}`,
      courseId: course.id,
      courseName: course.name,
      outCourseId: outSub.id,
      outCourseName: outSub.name,
      inCourseId: inSub.id,
      inCourseName: inSub.name,
      date: draft.date,
      teeBox: draft.teeBox,
      weather: draft.weather,
      memo: draft.memo,
      totalScore: holes.reduce((sum, h) => sum + h.score, 0),
      totalPar: holes.reduce((sum, h) => sum + h.par, 0),
      overPar: 0,
      holes
    };

    state.activeRound = newRound;
    state.currentHoleIndex = 0;
    state.currentView = 'liveRound';
    StorageService.saveActiveRound(newRound);
    renderApp();
  },

  quickStartCourseRound: (courseId) => {
    state.newRoundDraft = {
      courseId: courseId,
      teeBox: '화이트',
      date: new Date().toISOString().slice(0, 10),
      weather: '맑음 ☀️',
      memo: ''
    };
    window.appActions.onSelectCourseInDraft(courseId);
    state.currentView = 'newRoundSetup';
    renderApp();
  },

  cancelActiveRound: () => {
    if (confirm('진행 중인 라운드 기록을 취소하시겠습니까? (입력한 내용이 삭제됩니다)')) {
      state.activeRound = null;
      StorageService.clearActiveRound();
      state.currentView = 'home';
      renderApp();
    }
  },

  // 라이브 라운드 홀 이동
  setCurrentHole: (index) => {
    state.currentHoleIndex = Math.max(0, Math.min(17, index));
    renderApp();
  },

  nextHole: () => {
    if (state.currentHoleIndex < 17) {
      state.currentHoleIndex++;
      renderApp();
    }
  },

  prevHole: () => {
    if (state.currentHoleIndex > 0) {
      state.currentHoleIndex--;
      renderApp();
    }
  },

  // 라이브 라운드 홀 스코어 & 샷 입력
  setHoleScore: (score) => {
    updateActiveHoleInRound(h => {
      h.score = Math.max(1, score);
    });
  },

  adjustHoleScore: (delta) => {
    updateActiveHoleInRound(h => {
      const current = h.score !== undefined ? h.score : (h.par || 4);
      h.score = Math.max(1, current + delta);
    });
  },

  promptExactScore: () => {
    const current = state.activeRound?.holes[state.currentHoleIndex]?.score || 4;
    const input = prompt('홀 총 타수를 직접 입력하세요:', `${current}`);
    if (input !== null) {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num > 0) {
        window.appActions.setHoleScore(num);
      }
    }
  },

  setHoleFairway: (direction) => {
    updateActiveHoleInRound(h => {
      h.fairway = direction;
    });
  },

  setHolePar3Teeshot: (direction) => {
    updateActiveHoleInRound(h => {
      h.fairway = direction;
      h.gir = (direction === 'center');
      h.girAuto = false;
    });
  },

  setHolePutts: (putts) => {
    updateActiveHoleInRound(h => {
      h.putts = putts;
    });
  },

  toggleHoleGir: () => {
    updateActiveHoleInRound(h => {
      h.gir = !h.gir;
      h.girAuto = false; // 수동 조작 시 자동계산 고정 해제
    });
  },

  adjustHoleBunker: (delta) => {
    updateActiveHoleInRound(h => {
      h.bunkerCount = Math.max(0, (h.bunkerCount || 0) + delta);
    });
  },

  adjustHolePenalty: (delta) => {
    updateActiveHoleInRound(h => {
      h.penaltyCount = Math.max(0, (h.penaltyCount || 0) + delta);
    });
  },

  updateHoleMemo: (memoText) => {
    if (!state.activeRound) return;
    const currentHole = state.activeRound.holes[state.currentHoleIndex];
    if (currentHole) {
      currentHole.memo = memoText;
      StorageService.saveActiveRound(state.activeRound);
    }
  },

  finishRound: () => {
    if (!state.activeRound) return;
    if (confirm('18홀 라운드를 종료하고 기록을 저장하시겠습니까?')) {
      const savedRound = StorageService.saveCompletedRound(state.activeRound);
      state.rounds = StorageService.getRounds();
      state.summaryRound = savedRound;
      state.activeRound = null;
      state.currentView = 'summary';
      renderApp();
    }
  },

  // 스코어카드 모달
  openScorecardModal: () => {
    state.isScorecardModalOpen = true;
    renderApp();
  },

  closeScorecardModal: () => {
    state.isScorecardModalOpen = false;
    state.selectedRoundDetail = null;
    renderApp();
  },

  openScorecardModalWithRound: (roundId) => {
    const found = state.rounds.find(r => r.id === roundId);
    if (found) {
      state.selectedRoundDetail = found;
      state.isScorecardModalOpen = true;
      renderApp();
    }
  },

  onScorecardHoleClick: (holeIndex) => {
    state.isScorecardModalOpen = false;
    if (state.activeRound) {
      state.currentHoleIndex = holeIndex;
      state.currentView = 'liveRound';
      renderApp();
    }
  },

  viewRoundDetail: (roundId) => {
    const found = state.rounds.find(r => r.id === roundId);
    if (found) {
      state.summaryRound = found;
      state.currentView = 'summary';
      renderApp();
      window.scrollTo(0, 0);
    }
  },

  copyRoundSummaryText: (roundId) => {
    const round = state.rounds.find(r => r.id === roundId) || state.summaryRound;
    if (!round) return;

    const stats = StatsCalculator.calculateRoundStats(round);
    const scoreDiff = round.overPar > 0 ? `+${round.overPar}` : (round.overPar === 0 ? 'E' : `${round.overPar}`);

    const text = `⛳ [골프 라운드 기록]
📍 ${round.courseName} (${round.outCourseName} / ${round.inCourseName})
📅 ${round.date} • ${round.teeBox || '화이트'}
🏆 스코어: ${round.totalScore}타 (${scoreDiff}) [전반 ${stats ? stats.front9Score : '-'} / 후반 ${stats ? stats.back9Score : '-'}]
🎯 FW 안착률: ${stats ? stats.fairwayHitPct : '-'}%
🟢 GIR (온그린): ${stats ? stats.girPct : '-'}%
⛳ 퍼팅: 총 ${stats ? stats.totalPutts : '-'}펏 (평균 ${stats ? stats.avgPutts : '-'}펏 / 3펏 ${stats ? stats.threePlusPuttCount : '-'}회)
💬 ${round.memo || ''}`;

    navigator.clipboard.writeText(text).then(() => {
      alert('📋 라운드 결과가 클립보드에 복사되었습니다! 카카오톡이나 메시지로 공유해보세요.');
    }).catch(() => {
      alert('복사하기 권한이 없습니다.');
    });
  },

  deleteRoundPrompt: (roundId) => {
    if (confirm('이 라운드 기록을 정말 삭제하시겠습니까?')) {
      state.rounds = StorageService.deleteRound(roundId);
      renderApp();
    }
  },

  setHistoryFilter: (courseName) => {
    state.historyCourseFilter = courseName;
    renderApp();
  },

  // 통계 액션
  setStatsTab: (tab) => {
    state.statsActiveTab = tab;
    renderApp();
  },

  onSelectStatsCourse: (courseId) => {
    state.statsSelectedCourseId = courseId;
    const course = state.courses.find(c => c.id === courseId);
    if (course && course.subCourses && course.subCourses.length > 0) {
      state.statsSelectedSubCourseId = course.subCourses[0].id;
    }
    renderApp();
  },

  onSelectStatsSubCourse: (subCourseId) => {
    state.statsSelectedSubCourseId = subCourseId;
    renderApp();
  },

  inspectCourseHoles: (courseId) => {
    window.appActions.onSelectStatsCourse(courseId);
    state.statsActiveTab = 'holes';
    renderApp();
    window.scrollTo(0, 0);
  },

  // 골프장 관리 액션
  setCourseSearchQuery: (q) => {
    state.courseSearchQuery = q;
    renderApp();
  },

  openAddCourseModal: () => {
    state.editingCourse = {
      id: `course-${Date.now()}`,
      name: '',
      location: '',
      type: '대중제',
      holesCount: 18,
      subCourses: [
        {
          id: `sub-${Date.now()}-1`,
          name: 'OUT 코스',
          holes: [
            { holeNumber: 1, par: 4, handicap: 5, distance: 350 },
            { holeNumber: 2, par: 5, handicap: 1, distance: 490 },
            { holeNumber: 3, par: 3, handicap: 7, distance: 150 },
            { holeNumber: 4, par: 4, handicap: 3, distance: 370 },
            { holeNumber: 5, par: 4, handicap: 8, distance: 330 },
            { holeNumber: 6, par: 5, handicap: 2, distance: 510 },
            { holeNumber: 7, par: 4, handicap: 4, distance: 360 },
            { holeNumber: 8, par: 3, handicap: 9, distance: 140 },
            { holeNumber: 9, par: 4, handicap: 6, distance: 350 }
          ]
        },
        {
          id: `sub-${Date.now()}-2`,
          name: 'IN 코스',
          holes: [
            { holeNumber: 1, par: 4, handicap: 4, distance: 360 },
            { holeNumber: 2, par: 4, handicap: 6, distance: 340 },
            { holeNumber: 3, par: 3, handicap: 8, distance: 145 },
            { holeNumber: 4, par: 5, handicap: 2, distance: 515 },
            { holeNumber: 5, par: 4, handicap: 5, distance: 355 },
            { holeNumber: 6, par: 4, handicap: 1, distance: 380 },
            { holeNumber: 7, par: 3, handicap: 9, distance: 135 },
            { holeNumber: 8, par: 5, handicap: 3, distance: 500 },
            { holeNumber: 9, par: 4, handicap: 7, distance: 340 }
          ]
        }
      ]
    };
    state.isCourseEditModalOpen = true;
    renderApp();
  },

  startEditCourse: (courseId) => {
    const course = state.courses.find(c => c.id === courseId);
    if (course) {
      state.editingCourse = JSON.parse(JSON.stringify(course));
      state.isCourseEditModalOpen = true;
      renderApp();
    }
  },

  closeCourseEditModal: () => {
    state.isCourseEditModalOpen = false;
    state.editingCourse = null;
    renderApp();
  },

  addSubCourseToEdit: () => {
    if (!state.editingCourse) return;
    const count = state.editingCourse.subCourses.length + 1;
    state.editingCourse.subCourses.push({
      id: `sub-${Date.now()}-${count}`,
      name: `${count}코스`,
      holes: Array.from({ length: 9 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4,
        handicap: i + 1,
        distance: 350
      }))
    });
    renderApp();
  },

  removeSubCourseFromEdit: (index) => {
    if (!state.editingCourse || state.editingCourse.subCourses.length <= 1) return;
    state.editingCourse.subCourses.splice(index, 1);
    renderApp();
  },

  saveCourseFromModal: () => {
    const nameInput = document.getElementById('courseEditName');
    const locInput = document.getElementById('courseEditLocation');
    const typeSelect = document.getElementById('courseEditType');

    if (!nameInput || !nameInput.value.trim()) {
      alert('골프장 이름을 입력해주세요.');
      return;
    }

    const courseData = state.editingCourse;
    courseData.name = nameInput.value.trim();
    courseData.location = locInput ? locInput.value.trim() : '';
    courseData.type = typeSelect ? typeSelect.value : '대중제';
    courseData.holesCount = courseData.subCourses.length * 9;

    // 각 서브코스 이름 & 홀 파/핸디캡 값 수집
    const scContainers = document.querySelectorAll('#subCoursesContainer > div');
    scContainers.forEach((el, scIdx) => {
      const nameInp = el.querySelector('.subcourse-name-input');
      if (nameInp && courseData.subCourses[scIdx]) {
        courseData.subCourses[scIdx].name = nameInp.value.trim() || `${scIdx + 1}코스`;
      }
    });

    const parSelects = document.querySelectorAll('.hole-par-select');
    parSelects.forEach(sel => {
      const scIdx = parseInt(sel.getAttribute('data-sc'), 10);
      const hIdx = parseInt(sel.getAttribute('data-h'), 10);
      if (courseData.subCourses[scIdx] && courseData.subCourses[scIdx].holes[hIdx]) {
        courseData.subCourses[scIdx].holes[hIdx].par = parseInt(sel.value, 10) || 4;
      }
    });

    const hcpInputs = document.querySelectorAll('.hole-hcp-input');
    hcpInputs.forEach(inp => {
      const scIdx = parseInt(inp.getAttribute('data-sc'), 10);
      const hIdx = parseInt(inp.getAttribute('data-h'), 10);
      if (courseData.subCourses[scIdx] && courseData.subCourses[scIdx].holes[hIdx]) {
        courseData.subCourses[scIdx].holes[hIdx].handicap = parseInt(inp.value, 10) || (hIdx + 1);
      }
    });

    // 기존 수정인지 신규인지 판별
    const existing = state.courses.find(c => c.id === courseData.id);
    if (existing) {
      StorageService.updateCourse(courseData.id, courseData);
    } else {
      StorageService.addCourse(courseData);
    }

    state.courses = StorageService.getCourses();
    state.isCourseEditModalOpen = false;
    state.editingCourse = null;
    renderApp();
  },

  deleteCoursePrompt: (courseId) => {
    if (confirm('이 골프장 정보를 삭제하시겠습니까?')) {
      state.courses = StorageService.deleteCourse(courseId);
      renderApp();
    }
  },

  exportDataBackup: () => {
    StorageService.exportData();
  },

  importDataBackup: (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = StorageService.importData(evt.target.result);
      if (res.success) {
        state.courses = StorageService.getCourses();
        state.rounds = StorageService.getRounds();
        alert('✅ 백업 파일이 성공적으로 복원되었습니다!');
        renderApp();
      } else {
        alert('❌ 백업 파일 복원에 실패했습니다: ' + res.error);
      }
    };
    reader.readAsText(file);
  },

  resetDefaultsPrompt: () => {
    if (confirm('모든 데이터를 초기 프리셋(자유로CC 등)으로 리셋하시겠습니까? 기존 기록은 삭제됩니다.')) {
      StorageService.resetToDefaults();
      state.courses = StorageService.getCourses();
      state.rounds = StorageService.getRounds();
      state.activeRound = null;
      alert('초기화되었습니다.');
      renderApp();
    }
  }
};

// 앱 초기화 실행
function initApp() {
  state.courses = StorageService.getCourses();
  state.rounds = StorageService.getRounds();
  state.activeRound = StorageService.getActiveRound();

  if (state.activeRound) {
    state.currentView = 'liveRound';
  } else {
    state.currentView = 'home';
  }

  renderApp();
}

window.addEventListener('DOMContentLoaded', initApp);
