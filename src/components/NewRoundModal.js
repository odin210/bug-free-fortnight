// 새 라운드 시작 설정 모달 / 화면
export function renderNewRoundModal(state) {
  const courses = state.courses || [];
  const selectedCourseId = state.newRoundDraft?.courseId || (courses[0]?.id || '');
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const subCourses = selectedCourse ? (selectedCourse.subCourses || []) : [];
  const outCourseId = state.newRoundDraft?.outCourseId || (subCourses[0]?.id || '');
  const inCourseId = state.newRoundDraft?.inCourseId || (subCourses[1]?.id || subCourses[0]?.id || '');

  const todayStr = new Date().toISOString().slice(0, 10);
  const dateVal = state.newRoundDraft?.date || todayStr;
  const teeBoxVal = state.newRoundDraft?.teeBox || '화이트';
  const weatherVal = state.newRoundDraft?.weather || '맑음 ☀️';
  const memoVal = state.newRoundDraft?.memo || '';

  const teeBoxes = ['화이트', '블루', '블랙', '레드', '옐로우'];
  const weathers = ['맑음 ☀️', '구름많음 ⛅', '흐림 ☁️', '비 🌧️', '바람많음 💨'];

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-12">
      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span>⛳</span> 새 라운드 설정
          </h2>
          <p class="text-xs text-slate-400">골프장과 전/후반 코스를 지정하고 라운드를 시작합니다.</p>
        </div>
        <button onclick="window.appActions.navigate('home')" 
                class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold">
          ✕ 닫기
        </button>
      </div>

      <!-- 1. 골프장 선택 -->
      <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <label class="block text-xs font-bold text-emerald-400">
          1. 골프장 선택
        </label>

        <select id="courseSelect" onchange="window.appActions.onSelectCourseInDraft(this.value)"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500">
          ${courses.map(c => `
            <option value="${c.id}" ${c.id === selectedCourseId ? 'selected' : ''}>
              ${c.name} (${c.location || ''} • ${c.holesCount || 18}홀)
            </option>
          `).join('')}
        </select>

        <!-- 코스가 없을 때 빠른 추가 안내 -->
        <div class="flex items-center justify-between text-xs pt-1">
          <span class="text-slate-400">원하는 골프장이 목록에 없나요?</span>
          <button onclick="window.appActions.navigate('courses')" class="text-emerald-400 font-bold hover:underline">
            + 새 구장/코스 등록
          </button>
        </div>
      </div>

      <!-- 2. 전반 / 후반 코스 선택 (자유로CC 대한/민국/통일 등) -->
      ${selectedCourse ? `
        <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-4">
          <label class="block text-xs font-bold text-emerald-400">
            2. 코스 조합 선택 (전반 9홀 ➔ 후반 9홀)
          </label>

          <!-- 전반 9홀 선택 -->
          <div class="space-y-1.5">
            <span class="text-xs text-slate-300 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 전반 코스 (OUT 1~9번홀)
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              ${subCourses.map(sc => `
                <button type="button" 
                        onclick="window.appActions.updateNewRoundDraft({ outCourseId: '${sc.id}' })"
                        class="p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          sc.id === outCourseId
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }">
                  ${sc.name}
                  <div class="text-[10px] font-normal text-emerald-200/80">9홀 (Par 36)</div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 후반 9홀 선택 -->
          <div class="space-y-1.5 pt-2 border-t border-slate-800">
            <span class="text-xs text-slate-300 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-teal-500"></span> 후반 코스 (IN 10~18번홀)
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              ${subCourses.map(sc => `
                <button type="button" 
                        onclick="window.appActions.updateNewRoundDraft({ inCourseId: '${sc.id}' })"
                        class="p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          sc.id === inCourseId
                            ? 'bg-teal-600 border-teal-400 text-white shadow-md'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }">
                  ${sc.name}
                  <div class="text-[10px] font-normal text-teal-200/80">9홀 (Par 36)</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- 3. 추가 라운드 정보 (티박스, 날짜, 날씨, 메모) -->
      <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-3.5">
        <label class="block text-xs font-bold text-emerald-400">
          3. 라운드 세부 설정
        </label>

        <!-- 티박스 선택 -->
        <div>
          <span class="text-xs text-slate-400 block mb-1.5">티잉 구역 (Tee Box)</span>
          <div class="flex flex-wrap gap-2">
            ${teeBoxes.map(t => `
              <button type="button" 
                      onclick="window.appActions.updateNewRoundDraft({ teeBox: '${t}' })"
                      class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        t === teeBoxVal 
                          ? 'bg-slate-200 text-slate-950 border-white font-bold shadow' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 날짜 및 날씨 -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-xs text-slate-400 block mb-1">날짜</span>
            <input type="date" value="${dateVal}" 
                   onchange="window.appActions.updateNewRoundDraft({ date: this.value })"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <span class="text-xs text-slate-400 block mb-1">날씨</span>
            <select onchange="window.appActions.updateNewRoundDraft({ weather: this.value })"
                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500">
              ${weathers.map(w => `
                <option value="${w}" ${w === weatherVal ? 'selected' : ''}>${w}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 동반자 / 메모 -->
        <div>
          <span class="text-xs text-slate-400 block mb-1">동반자 또는 목표 메모</span>
          <input type="text" value="${memoVal}" placeholder="예: 김프로, 박부장과 친선 라운드 / 오늘 80타 목표"
                 oninput="window.appActions.updateNewRoundDraft({ memo: this.value })"
                 class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      <!-- 라운드 시작 버튼 -->
      <button onclick="window.appActions.startRoundFromDraft()"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
        <span>🚀</span> 라운드 시작 (1번홀 이동)
      </button>
    </div>
  `;
}
