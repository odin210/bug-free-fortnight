import { StatsCalculator } from '../services/stats.js';

export function renderStatsView(state) {
  const rounds = state.rounds || [];
  const courses = state.courses || [];
  const activeTab = state.statsActiveTab || 'courses'; // 'overview', 'courses', 'holes'

  const globalStats = StatsCalculator.calculateGlobalStats(rounds);

  // 홀별 분석을 위한 타겟 구장 및 코스 선택
  const selectedCourseId = state.statsSelectedCourseId || (courses[0]?.id || '');
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const subCourses = selectedCourse ? (selectedCourse.subCourses || []) : [];
  const selectedSubCourseId = state.statsSelectedSubCourseId || (subCourses[0]?.id || '');
  const selectedSubCourse = subCourses.find(sc => sc.id === selectedSubCourseId) || subCourses[0];

  const holeStats = selectedCourse 
    ? StatsCalculator.calculateCourseHoleStats(rounds, selectedCourse.id, selectedSubCourseId)
    : [];

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-16">
      <!-- 헤더 -->
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <span>📊</span> 골프 통계 및 공략 분석
        </h2>
        <p class="text-xs text-slate-400">구장별 스코어와 코스/홀별 누적 데이터를 분석합니다.</p>
      </div>

      <!-- 상단 서브 탭 (종합 / 구장별 / 홀별 정밀분석) -->
      <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button onclick="window.appActions.setStatsTab('courses')"
                class="py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'courses' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }">
          🗺️ 구장별 스코어
        </button>

        <button onclick="window.appActions.setStatsTab('holes')"
                class="py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'holes' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }">
          ⛳ 홀별 누적분석
        </button>

        <button onclick="window.appActions.setStatsTab('overview')"
                class="py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }">
          📈 종합 지표
        </button>
      </div>

      <!-- 1. 구장별 스코어 랭킹 탭 -->
      ${activeTab === 'courses' ? `
        <div class="space-y-3">
          <div class="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>골프장별 평균 타수 및 전적</span>
            <span class="text-slate-400">총 ${globalStats.courseRankings.length}개 구장</span>
          </div>

          ${globalStats.courseRankings.length === 0 ? `
            <div class="glass-card p-8 rounded-2xl text-center text-slate-400">
              <p class="text-sm">기록된 구장별 데이터가 없습니다.</p>
            </div>
          ` : `
            <div class="space-y-2.5">
              ${globalStats.courseRankings.map((c, rank) => `
                <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full ${rank === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 font-bold'} text-xs flex items-center justify-center">
                        ${rank + 1}
                      </span>
                      <div>
                        <h4 class="font-bold text-sm text-white">${c.courseName}</h4>
                        <span class="text-[11px] text-slate-400">총 ${c.roundsCount}회 라운드</span>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-2xl font-black text-emerald-400">${c.avgScore}타</div>
                      <div class="text-[10px] text-slate-400">최저: <strong class="text-white">${c.bestScore}타</strong></div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/60 rounded-xl text-center text-xs">
                    <div>
                      <div class="text-[10px] text-slate-400">평균 퍼트</div>
                      <div class="font-bold text-amber-400">${c.avgPutts}펏</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">FW 안착률</div>
                      <div class="font-bold text-emerald-400">${c.avgFwPct}%</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">GIR 적중률</div>
                      <div class="font-bold text-sky-400">${c.avgGirPct}%</div>
                    </div>
                  </div>

                  <button onclick="window.appActions.inspectCourseHoles('${c.courseId}')"
                          class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1">
                    이 구장의 홀별 상세 공략/기록 보기 ➔
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- 2. 홀별 누적 정밀 분석 탭 -->
      ${activeTab === 'holes' ? `
        <div class="space-y-3.5">
          <!-- 구장 및 서브 코스 선택 셀렉터 -->
          <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <label class="block text-xs font-bold text-slate-300">
              분석할 골프장 및 코스 선택
            </label>
            <div class="grid grid-cols-2 gap-2">
              <select onchange="window.appActions.onSelectStatsCourse(this.value)"
                      class="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500">
                ${courses.map(c => `
                  <option value="${c.id}" ${c.id === selectedCourseId ? 'selected' : ''}>
                    ${c.name}
                  </option>
                `).join('')}
              </select>

              <select onchange="window.appActions.onSelectStatsSubCourse(this.value)"
                      class="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500">
                ${subCourses.map(sc => `
                  <option value="${sc.id}" ${sc.id === selectedSubCourseId ? 'selected' : ''}>
                    ${sc.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- 홀별 카드 목록 -->
          <div class="space-y-2.5">
            <div class="text-xs font-bold text-slate-300 px-1">
              📍 ${selectedCourse ? selectedCourse.name : ''} - ${selectedSubCourse ? selectedSubCourse.name : ''} 1~9번홀 누적 성적
            </div>

            ${holeStats.length === 0 ? `
              <div class="glass-card p-8 rounded-2xl text-center text-slate-400">
                <p class="text-sm">선택한 코스에 아직 플레이 기록이 없습니다.</p>
                <p class="text-xs text-slate-500 mt-1">이 코스에서 라운드를 진행하면 홀별 데이터가 자동으로 쌓입니다.</p>
              </div>
            ` : `
              ${holeStats.map(h => {
                const par = h.par || 4;
                const avgDiff = h.avgOver;
                const diffSign = avgDiff > 0 ? `+${avgDiff}` : (avgDiff === 0 ? 'E' : `${avgDiff}`);
                const isToughHole = avgDiff >= 1.0;

                return `
                  <div class="glass-card p-3.5 rounded-2xl border ${isToughHole ? 'border-amber-900/60 bg-amber-950/20' : 'border-slate-700/60'} space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-black text-sm flex items-center justify-center border border-slate-700">
                          ${h.holeNumber}
                        </span>
                        <div>
                          <div class="font-bold text-sm text-white">
                            ${h.holeNumber}번홀 <span class="text-xs text-emerald-400 font-semibold">(PAR ${par})</span>
                          </div>
                          <div class="text-[10px] text-slate-400">
                            핸디캡 ${h.handicap || '-'} • 거리 ${h.distance || '-'}m • 총 ${h.playCount}회 플레이
                          </div>
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="text-xl font-black text-white leading-tight">
                          평균 ${h.avgScore}타
                        </div>
                        <div class="text-xs font-bold ${avgDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}">
                          (${diffSign})
                        </div>
                      </div>
                    </div>

                    <!-- 핵심 지표 3단 그리드 -->
                    <div class="grid grid-cols-4 gap-1 p-2 bg-slate-900/80 rounded-xl text-center text-xs">
                      <div>
                        <div class="text-[10px] text-slate-400">파세이브율</div>
                        <div class="font-bold text-emerald-400">${h.parSavePct}%</div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400">FW 안착</div>
                        <div class="font-bold text-teal-400">${h.fairwayHitPct !== null ? `${h.fairwayHitPct}%` : '파3'}</div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400">온그린(GIR)</div>
                        <div class="font-bold text-sky-400">${h.girPct}%</div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400">평균퍼트</div>
                        <div class="font-bold text-amber-400">${h.avgPutts}펏</div>
                      </div>
                    </div>

                    <!-- 발생 스코어 내역 -->
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-300 overflow-x-auto">
                      <span class="text-slate-500 font-medium">기록:</span>
                      ${h.scoreCounts.eagle > 0 ? `<span class="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">이글 ${h.scoreCounts.eagle}</span>` : ''}
                      ${h.scoreCounts.birdie > 0 ? `<span class="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">버디 ${h.scoreCounts.birdie}</span>` : ''}
                      ${h.scoreCounts.par > 0 ? `<span class="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">파 ${h.scoreCounts.par}</span>` : ''}
                      ${h.scoreCounts.bogey > 0 ? `<span class="px-1.5 py-0.5 rounded bg-blue-600 text-white">보기 ${h.scoreCounts.bogey}</span>` : ''}
                      ${h.scoreCounts.doubleBogey > 0 ? `<span class="px-1.5 py-0.5 rounded bg-indigo-600 text-white">더블 ${h.scoreCounts.doubleBogey}</span>` : ''}
                      ${h.scoreCounts.triplePlus > 0 ? `<span class="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">트리플+ ${h.scoreCounts.triplePlus}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            `}
          </div>
        </div>
      ` : ''}

      <!-- 3. 종합 지표 및 추이 탭 -->
      ${activeTab === 'overview' ? `
        <div class="space-y-4">
          <!-- 스코어 히스토리 추이 표 -->
          <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h4 class="text-xs font-bold text-slate-300">📈 최근 라운드 스코어 변천사</h4>
            <div class="space-y-2">
              ${globalStats.scoreTrend.map(item => `
                <div class="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl text-xs">
                  <div>
                    <div class="font-bold text-white">${item.courseName}</div>
                    <div class="text-[10px] text-slate-400">${item.date} • FW ${item.fwPct}% • GIR ${item.girPct}%</div>
                  </div>
                  <div class="text-right font-black text-sm text-emerald-400">
                    ${item.score}타 <span class="text-xs font-bold text-slate-400">(${item.putts}펏)</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 퍼팅 및 쇼트게임 요약 -->
          <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-2.5">
            <h4 class="text-xs font-bold text-slate-300">⛳ 퍼팅 & 숏게임 진단</h4>
            <div class="space-y-2 text-xs text-slate-300">
              <div class="flex justify-between py-1.5 border-b border-slate-800">
                <span class="text-slate-400">라운드당 평균 퍼트수</span>
                <span class="font-bold text-amber-400">${(parseFloat(globalStats.avgPutts) * 18).toFixed(1)}개 (홀당 ${globalStats.avgPutts}펏)</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-800">
                <span class="text-slate-400">라운드당 쓰리펏 발생 횟수</span>
                <span class="font-bold text-rose-400">${globalStats.avgThreePuttsPerRound}회</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-slate-400">평균 그린 적중률 (GIR)</span>
                <span class="font-bold text-sky-400">${globalStats.avgGirPct}% (18홀 중 약 ${(18 * globalStats.avgGirPct / 100).toFixed(1)}홀 온그린)</span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
