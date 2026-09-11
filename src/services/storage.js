import { DEFAULT_COURSES, SAMPLE_ROUNDS } from '../data/presets.js';

const STORAGE_KEYS = {
  COURSES: 'golf_tracker_courses_v1',
  ROUNDS: 'golf_tracker_rounds_v1',
  ACTIVE_ROUND: 'golf_tracker_active_round_v1',
  SETTINGS: 'golf_tracker_settings_v1'
};

export const StorageService = {
  // 골프장 목록 가져오기 (로컬 저장소 또는 기본 프리셋)
  getCourses: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read courses from localStorage', e);
    }
    // 기본 프리셋 저장 후 반환
    StorageService.saveCourses(DEFAULT_COURSES);
    return DEFAULT_COURSES;
  },

  saveCourses: (courses) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses', e);
    }
  },

  addCourse: (newCourse) => {
    const courses = StorageService.getCourses();
    const courseWithId = {
      ...newCourse,
      id: newCourse.id || `course-${Date.now()}`
    };
    courses.push(courseWithId);
    StorageService.saveCourses(courses);
    return courseWithId;
  },

  updateCourse: (courseId, updatedCourse) => {
    const courses = StorageService.getCourses();
    const index = courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...updatedCourse };
      StorageService.saveCourses(courses);
      return courses[index];
    }
    return null;
  },

  deleteCourse: (courseId) => {
    const courses = StorageService.getCourses();
    const filtered = courses.filter(c => c.id !== courseId);
    StorageService.saveCourses(filtered);
    return filtered;
  },

  // 라운드 목록 가져오기
  getRounds: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUNDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read rounds from localStorage', e);
    }
    // 초기에는 샘플 라운드 제공
    StorageService.saveRounds(SAMPLE_ROUNDS);
    return SAMPLE_ROUNDS;
  },

  saveRounds: (rounds) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
    } catch (e) {
      console.error('Failed to save rounds', e);
    }
  },

  saveCompletedRound: (round) => {
    const rounds = StorageService.getRounds();
    const roundWithId = {
      ...round,
      id: round.id || `round-${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    // 기존에 동일 ID가 있으면 덮어쓰기, 없으면 앞에 추가
    const index = rounds.findIndex(r => r.id === roundWithId.id);
    if (index !== -1) {
      rounds[index] = roundWithId;
    } else {
      rounds.unshift(roundWithId);
    }
    StorageService.saveRounds(rounds);
    // 진행 중인 라운드 삭제
    StorageService.clearActiveRound();
    return roundWithId;
  },

  deleteRound: (roundId) => {
    const rounds = StorageService.getRounds();
    const filtered = rounds.filter(r => r.id !== roundId);
    StorageService.saveRounds(filtered);
    return filtered;
  },

  // 진행 중인 라운드 임시 저장 & 복원
  getActiveRound: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROUND);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveActiveRound: (round) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROUND, JSON.stringify(round));
    } catch (e) {
      console.error('Failed to auto-save active round', e);
    }
  },

  clearActiveRound: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROUND);
    } catch (e) {
      console.error('Failed to clear active round', e);
    }
  },

  // 데이터 내보내기 (JSON 백업)
  exportData: () => {
    const exportObject = {
      version: 1,
      exportedAt: new Date().toISOString(),
      courses: StorageService.getCourses(),
      rounds: StorageService.getRounds()
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf_score_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 데이터 가져오기 (JSON 복원)
  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.courses && Array.isArray(data.courses)) {
        StorageService.saveCourses(data.courses);
      }
      if (data.rounds && Array.isArray(data.rounds)) {
        StorageService.saveRounds(data.rounds);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 데이터 초기화 (프리셋으로 리셋)
  resetToDefaults: () => {
    StorageService.saveCourses(DEFAULT_COURSES);
    StorageService.saveRounds(SAMPLE_ROUNDS);
    StorageService.clearActiveRound();
  }
};
