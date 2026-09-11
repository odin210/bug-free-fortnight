import { StatsCalculator } from '../services/stats.js';

export function renderHomeView(state) {
  const rounds = state.rounds || [];
  const activeRound = state.activeRound;
  const globalStats = StatsCalculator.calculateGlobalStats(rounds);
  const recentRounds = rounds.slice(0, 3);

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-8">
      <!-- 진행 중 라운드 배너 (있을 때만) -->
      ${activeRound ? `
        <div class="glass-card bg-amber-950/40 border-amber-500/40 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              <span class="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-slate-950"></span>
              진행 중인 라운드
            </span>
            <span class="text-xs text-amber-300 font-medium">${activeRound.date || '오늘'}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-1">
            ${activeRound.courseName}
          </h3>
          <p class="text-xs text-amber-200/80 mb-3">
            ${activeRound.outCourseName} ➔ ${activeRound.inCourseName} (${activeRound.teeBox || '화이트'})
          </p>
          <div class="flex gap-2">
            <button onclick="window.appActions.navigate('liveRound')"
                    class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all">
              ⚡ 이어서 기록하기
            </button>
            <button onclick="window.appActions.cancelActiveRound()"
                    class="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-300 font-medium rounded-xl text-xs transition-all">
              취소
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 새 라운드 시작 메인 CTA 버튼 -->
      ${!activeRound ? `
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-5 shadow-xl border border-emerald-500/30">
          <div class="relative z-10">
            <div class="inline-block px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-200 text-xs font-semibold mb-2">
              ⛳ 간편 필드 스코어 기록
            </div>
            <h2 class="text-2xl font-black text-white leading-tight mb-1">
              새 라운드 시작
            </h2>
            <p class="text-xs text-emerald-100/80 mb-4">
              국내 골프장 코스를 선택하고 3초 만에 원터치로 샷을 기록하세요.
            </p>
            <button onclick="window.appActions.openNewRoundModal()"
                    class="w-full py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 font-black rounded-xl text-base shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <span>⛳</span> 라운드 시작하기
            </button>
          </div>
          <!-- 배경 장식 -->
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
        </div>
      ` : ''}

      <!-- 내 골프 통계 요약 카드 -->
      <div class="glass-card p-4 rounded-2xl border border-slate-700/60">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <span>📊</span> 나의 누적 골프 스탯
          </h3>
          <button onclick="window.appActions.navigate('stats')" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            상세 분석 ➔
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700/40 text-center">
            <div class="text-[11px] text-slate-400 mb-0.5">평균 스코어</div>
            <div class="text-xl font-black text-emerald-400">
              ${globalStats.avgScore > 0 ? globalStats.avgScore : '-'}
            </div>
            <div class="text-[10px] text-slate-500">베스트: ${globalStats.bestScore > 0 ? globalStats.bestScore : '-'}</div>
          </div>

          <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700/40 text-center">
            <div class="text-[11px] text-slate-400 mb-0.5">평균 퍼팅</div>
            <div class="text-xl font-black text-amber-400">
              ${globalStats.avgPutts !== '0.0' ? `${globalStats.avgPutts}펏` : '-'}
            </div>
            <div class="text-[10px] text-slate-500">3펏/R: ${globalStats.avgThreePuttsPerRound}개</div>
          </div>

          <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700/40 text-center">
            <div class="text-[11px] text-slate-400 mb-0.5">그린 적중률(GIR)</div>
            <div class="text-xl font-black text-sky-400">
              ${globalStats.avgGirPct > 0 ? `${globalStats.avgGirPct}%` : '-'}
            </div>
            <div class="text-[10px] text-slate-500">FW안착: ${globalStats.avgFairwayPct}%</div>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>총 기록된 라운드</span>
          <span class="font-bold text-slate-200">${globalStats.totalRounds}회</span>
        </div>
      </div>

      <!-- 최근 라운드 히스토리 리스트 -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <span>📋</span> 최근 라운드 기록
          </h3>
          <button onclick="window.appActions.navigate('history')" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            전체 보기 (${rounds.length})
          </button>
        </div>

        ${recentRounds.length === 0 ? `
          <div class="glass-card p-6 rounded-2xl text-center text-slate-400">
            <p class="text-sm mb-2">아직 기록된 라운드가 없습니다.</p>
            <p class="text-xs text-slate-500">새 라운드를 시작해 첫 번째 스코어를 남겨보세요!</p>
          </div>
        ` : `
          <div class="space-y-2">
            ${recentRounds.map(r => {
              const rStats = StatsCalculator.calculateRoundStats(r);
              const scoreDiff = r.overPar !== undefined ? r.overPar : (r.totalScore - (r.totalPar || 72));
              const sign = scoreDiff > 0 ? `+${scoreDiff}` : (scoreDiff === 0 ? 'E' : `${scoreDiff}`);

              return `
                <div onclick="window.appActions.viewRoundDetail('${r.id}')"
                     class="glass-card p-3.5 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]">
                  <div class="flex-1 min-w-0 pr-3">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-bold text-sm text-white truncate">${r.courseName}</span>
                      <span class="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">${r.date}</span>
                    </div>
                    <div class="text-xs text-slate-400 truncate">
                      ${r.outCourseName} / ${r.inCourseName} • ${r.teeBox || '화이트'}
                    </div>
                    ${rStats ? `
                      <div class="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span class="text-emerald-400">FW ${rStats.fairwayHitPct}%</span>
                        <span>•</span>
                        <span class="text-sky-400">GIR ${rStats.girPct}%</span>
                        <span>•</span>
                        <span class="text-amber-400">평균 ${rStats.avgPutts}펏</span>
                      </div>
                    ` : ''}
                  </div>

                  <div class="text-right pl-2 border-l border-slate-800">
                    <div class="text-2xl font-black text-white leading-tight">${r.totalScore || 72}</div>
                    <div class="text-xs font-bold ${scoreDiff > 0 ? 'text-amber-400' : (scoreDiff < 0 ? 'text-red-400' : 'text-emerald-400')}">
                      (${sign})
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- 빠른 안내 가이드 -->
      <div class="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <h4 class="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
          <span>💡</span> 필드에서 빠르고 편하게 기록하는 팁
        </h4>
        <ul class="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>홀 이동 시 <strong class="text-emerald-300">티샷 방향(가운데/좌/우)</strong>과 <strong class="text-emerald-300">퍼팅 수</strong>만 탭하면 끝!</li>
          <li>GIR(온그린 여부)과 상대 타수는 입력된 타수와 퍼트수에 따라 자동 계산됩니다.</li>
          <li>인터넷이 불안정한 산악 골프장에서도 기기에 안전하게 자동 저장됩니다.</li>
        </ul>
      </div>
    </div>
  `;
}
