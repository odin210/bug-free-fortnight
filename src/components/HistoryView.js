import { StatsCalculator } from '../services/stats.js';

export function renderHistoryView(state) {
  const rounds = state.rounds || [];
  const filterCourse = state.historyCourseFilter || 'all';

  // 골프장 목록 추출 (필터용)
  const courseNames = Array.from(new Set(rounds.map(r => r.courseName)));

  const filteredRounds = filterCourse === 'all'
    ? rounds
    : rounds.filter(r => r.courseName === filterCourse);

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-16">
      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> 라운드 기록함
          </h2>
          <p class="text-xs text-slate-400">저장된 전체 ${rounds.length}개의 라운드 기록입니다.</p>
        </div>
        <button onclick="window.appActions.openNewRoundModal()"
                class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow">
          + 새 라운드
        </button>
      </div>

      <!-- 구장별 필터 칩 바 -->
      ${courseNames.length > 1 ? `
        <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button onclick="window.appActions.setHistoryFilter('all')"
                  class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    filterCourse === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }">
            전체 (${rounds.length})
          </button>
          ${courseNames.map(cn => {
            const cnt = rounds.filter(r => r.courseName === cn).length;
            return `
              <button onclick="window.appActions.setHistoryFilter('${cn}')"
                      class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        filterCourse === cn
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }">
                ${cn} (${cnt})
              </button>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- 라운드 카드 목록 -->
      ${filteredRounds.length === 0 ? `
        <div class="glass-card p-10 rounded-2xl text-center text-slate-400 space-y-3">
          <div class="text-4xl">⛳</div>
          <p class="text-sm font-bold text-slate-300">해당 조건의 라운드 기록이 없습니다.</p>
          <button onclick="window.appActions.openNewRoundModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
            새 라운드 시작하기
          </button>
        </div>
      ` : `
        <div class="space-y-3">
          ${filteredRounds.map(r => {
            const stats = StatsCalculator.calculateRoundStats(r);
            const scoreDiff = r.overPar !== undefined ? r.overPar : (r.totalScore - (r.totalPar || 72));
            const sign = scoreDiff > 0 ? `+${scoreDiff}` : (scoreDiff === 0 ? 'E' : `${scoreDiff}`);

            return `
              <div class="glass-card p-4 rounded-2xl border border-slate-700/60 hover:border-emerald-500/50 transition-all space-y-3 shadow-md">
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-base font-bold text-white">${r.courseName}</span>
                      <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">${r.date}</span>
                    </div>
                    <div class="text-xs text-slate-400">
                      ${r.outCourseName} ➔ ${r.inCourseName} • ${r.teeBox || '화이트'} • ${r.weather || '맑음'}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-3xl font-black text-white leading-none">${r.totalScore}</div>
                    <div class="text-xs font-bold ${scoreDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}">
                      (${sign})
                    </div>
                  </div>
                </div>

                <!-- 핵심 지표 칩 그리드 -->
                ${stats ? `
                  <div class="grid grid-cols-4 gap-1.5 py-2 px-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                    <div>
                      <div class="text-[10px] text-slate-400">FW안착</div>
                      <div class="text-xs font-black text-emerald-400">${stats.fairwayHitPct}%</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">GIR</div>
                      <div class="text-xs font-black text-sky-400">${stats.girPct}%</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">평균퍼트</div>
                      <div class="text-xs font-black text-amber-400">${stats.avgPutts}</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">3펏+</div>
                      <div class="text-xs font-black ${stats.threePlusPuttCount > 0 ? 'text-rose-400' : 'text-emerald-400'}">${stats.threePlusPuttCount}회</div>
                    </div>
                  </div>
                ` : ''}

                ${r.memo ? `
                  <div class="text-xs text-slate-400 bg-slate-850 px-3 py-1.5 rounded-lg">
                    💬 ${r.memo}
                  </div>
                ` : ''}

                <!-- 카드 하단 버튼들 -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button onclick="window.appActions.viewRoundDetail('${r.id}')"
                          class="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg font-bold">
                    상세 리포트 보기 ➔
                  </button>

                  <div class="flex items-center gap-2">
                    <button onclick="window.appActions.openScorecardModalWithRound('${r.id}')"
                            class="text-slate-400 hover:text-emerald-300 font-medium">
                      스코어카드
                    </button>
                    <span class="text-slate-600">|</span>
                    <button onclick="window.appActions.deleteRoundPrompt('${r.id}')"
                            class="text-slate-500 hover:text-red-400">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
