// 골프장 및 코스/홀 관리 뷰 컴포넌트
export function renderCourseManagerView(state) {
  const courses = state.courses || [];
  const searchQuery = state.courseSearchQuery || '';
  const editingCourse = state.editingCourse; // 편집 중인 구장

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-16">
      <!-- 상단 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span>🗺️</span> 골프장 & 코스 관리
          </h2>
          <p class="text-xs text-slate-400">국내 골프장의 9홀 코스 및 홀별 Par/핸디캡 정보를 관리합니다.</p>
        </div>
        <button onclick="window.appActions.openAddCourseModal()"
                class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1">
          <span>+</span> 구장 추가
        </button>
      </div>

      <!-- 검색창 -->
      <div class="relative">
        <input type="text" value="${searchQuery}" placeholder="골프장 이름 또는 지역 검색 (예: 자유로, 여주)"
               oninput="window.appActions.setCourseSearchQuery(this.value)"
               class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
      </div>

      <!-- 골프장 카드 목록 -->
      <div class="space-y-3">
        ${filteredCourses.length === 0 ? `
          <div class="glass-card p-8 rounded-2xl text-center text-slate-400">
            <p class="text-sm">검색 결과가 없습니다.</p>
          </div>
        ` : `
          ${filteredCourses.map(course => `
            <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-bold text-base text-white flex items-center gap-1.5">
                    ${course.name}
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                      ${course.type || '대중제'}
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400 mt-0.5">
                    📍 ${course.location || '국내'} • 총 ${course.holesCount || 18}홀
                  </p>
                </div>

                <div class="flex items-center gap-1.5">
                  <button onclick="window.appActions.startEditCourse('${course.id}')"
                          class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium border border-slate-700">
                    수정
                  </button>
                  <button onclick="window.appActions.deleteCoursePrompt('${course.id}')"
                          class="px-2.5 py-1 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 text-xs rounded-lg font-medium border border-slate-700">
                    삭제
                  </button>
                </div>
              </div>

              <!-- 9홀 단위 코스 뱃지 목록 -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[11px] text-slate-400 font-medium">포함된 9홀 코스:</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  ${(course.subCourses || []).map(sc => `
                    <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div class="font-bold text-white">${sc.name}</div>
                      <div class="text-[10px] text-slate-400">9홀 (Par ${sc.holes.reduce((sum, h) => sum + (h.par || 4), 0)})</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 빠른 라운드 시작 버튼 -->
              <button onclick="window.appActions.quickStartCourseRound('${course.id}')"
                      class="w-full py-2 bg-slate-800 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700">
                ⛳ 이 구장에서 바로 라운드 시작
              </button>
            </div>
          `).join('')}
        `}
      </div>

      <!-- 데이터 백업 및 복원 (JSON) -->
      <div class="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2.5">
        <h4 class="text-xs font-bold text-slate-300 flex items-center gap-1">
          <span>💾</span> 데이터 백업 및 기기 이전 (JSON)
        </h4>
        <p class="text-[11px] text-slate-400">
          기록된 모든 골프장 정보와 라운드 스코어를 파일로 안전하게 저장하거나 다른 기기로 불러올 수 있습니다.
        </p>

        <div class="flex items-center gap-2 pt-1">
          <button onclick="window.appActions.exportDataBackup()"
                  class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700">
            📥 JSON 파일로 백업 다운로드
          </button>
          <label class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 text-center cursor-pointer">
            📤 백업 파일 복원
            <input type="file" accept=".json" class="hidden" onchange="window.appActions.importDataBackup(event)" />
          </label>
        </div>

        <div class="pt-2 text-right">
          <button onclick="window.appActions.resetDefaultsPrompt()" class="text-[11px] text-slate-500 hover:text-red-400 underline">
            기본 프리셋 데이터로 초기화
          </button>
        </div>
      </div>
    </div>
  `;
}

// 골프장 추가/수정 모달 렌더링
export function renderCourseEditModal(state) {
  const isEditing = !!state.editingCourse;
  const course = state.editingCourse || {
    name: '',
    location: '',
    type: '대중제',
    subCourses: [
      {
        name: 'OUT 코스',
        holes: Array.from({ length: 9 }, (_, i) => ({ holeNumber: i + 1, par: 4, handicap: i + 1, distance: 350 }))
      },
      {
        name: 'IN 코스',
        holes: Array.from({ length: 9 }, (_, i) => ({ holeNumber: i + 1, par: 4, handicap: i + 1, distance: 350 }))
      }
    ]
  };

  return `
    <div class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fade-in"
         onclick="if(event.target === this) window.appActions.closeCourseEditModal()">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 shadow-2xl space-y-4">
        <!-- 헤더 -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white flex items-center gap-1.5">
            <span>🗺️</span> ${isEditing ? '골프장 코스 정보 수정' : '신규 골프장 등록'}
          </h3>
          <button onclick="window.appActions.closeCourseEditModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <!-- 기본 정보 입력 -->
        <div class="space-y-2.5">
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">골프장 이름 *</label>
            <input type="text" id="courseEditName" value="${course.name || ''}" placeholder="예: 자유로 CC, 가평베네스트 GC"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-emerald-500" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-bold text-slate-300 block mb-1">지역 / 위치</label>
              <input type="text" id="courseEditLocation" value="${course.location || ''}" placeholder="예: 경기도 파주시"
                     class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-300 block mb-1">구분</label>
              <select id="courseEditType" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500">
                <option value="대중제" ${course.type === '대중제' ? 'selected' : ''}>대중제</option>
                <option value="회원제" ${course.type === '회원제' ? 'selected' : ''}>회원제</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 서브 코스(9홀 코스들) 목록 & 추가 -->
        <div class="space-y-3 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-emerald-400">
              9홀 코스 구성 (예: 대한, 민국, 통일 등)
            </label>
            <button onclick="window.appActions.addSubCourseToEdit()" class="text-xs text-emerald-400 font-bold hover:underline">
              + 9홀 코스 추가
            </button>
          </div>

          <div id="subCoursesContainer" class="space-y-3">
            ${course.subCourses.map((sc, scIdx) => `
              <div class="p-3 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2.5" data-sc-index="${scIdx}">
                <div class="flex items-center justify-between">
                  <input type="text" value="${sc.name}" placeholder="코스 이름 (예: 대한 코스)"
                         class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-bold focus:outline-none subcourse-name-input" />
                  
                  ${course.subCourses.length > 1 ? `
                    <button onclick="window.appActions.removeSubCourseFromEdit(${scIdx})" class="text-xs text-slate-500 hover:text-red-400">
                      코스 삭제
                    </button>
                  ` : ''}
                </div>

                <!-- 1~9홀 Par 및 핸디캡 간편 설정 그리드 -->
                <div class="overflow-x-auto">
                  <table class="w-full text-center text-[11px]">
                    <thead>
                      <tr class="text-slate-400 bg-slate-800">
                        <th class="p-1">홀</th>
                        ${sc.holes.map(h => `<th class="p-1">${h.holeNumber}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-slate-400 font-medium">PAR</td>
                        ${sc.holes.map((h, hIdx) => `
                          <td class="p-0.5">
                            <select class="bg-slate-800 text-white rounded p-0.5 text-[10px] font-bold hole-par-select" data-sc="${scIdx}" data-h="${hIdx}">
                              <option value="3" ${h.par === 3 ? 'selected' : ''}>3</option>
                              <option value="4" ${h.par === 4 ? 'selected' : ''}>4</option>
                              <option value="5" ${h.par === 5 ? 'selected' : ''}>5</option>
                              <option value="6" ${h.par === 6 ? 'selected' : ''}>6</option>
                            </select>
                          </td>
                        `).join('')}
                      </tr>
                      <tr>
                        <td class="text-slate-400 font-medium">HCP</td>
                        ${sc.holes.map((h, hIdx) => `
                          <td class="p-0.5">
                            <input type="number" min="1" max="18" value="${h.handicap || h.holeNumber}"
                                   class="w-6 bg-slate-800 text-slate-300 text-center rounded p-0.5 text-[10px] hole-hcp-input" data-sc="${scIdx}" data-h="${hIdx}" />
                          </td>
                        `).join('')}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 저장/취소 버튼 -->
        <div class="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button onclick="window.appActions.closeCourseEditModal()"
                  class="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700">
            취소
          </button>
          <button onclick="window.appActions.saveCourseFromModal()"
                  class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg">
            저장 완료
          </button>
        </div>
      </div>
    </div>
  `;
}
