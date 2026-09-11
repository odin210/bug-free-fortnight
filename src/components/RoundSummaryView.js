import { StatsCalculator } from '../services/stats.js';

// 라운드 종료 후 상세 분석 리포트 화면
export function renderRoundSummaryView(state) {
  const round = state.summaryRound || (state.rounds && state.rounds[0]);
  if (!round) {
    return `
      <div class="p-8 text-center text-slate-400">
        <p>표시할 라운드 기록이 없습니다.</p>
        <button onclick="window.appActions.navigate('home')" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">
          홈으로 가기
        </button>
      </div>
    `;
  }

  const stats = StatsCalculator.calculateRoundStats(round);
  const totalScore = round.totalScore || 72;
  const overPar = round.overPar !== undefined ? round.overPar : (totalScore - (round.totalPar || 72));
  const overParSign = overPar > 0 ? `+${overPar}` : (overPar === 0 ? 'E' : `${overPar}`);

  return `
    <div class="p-4 space-y-4 animate-fade-in pb-16">
      <!-- 최상단 축하 / 요약 헤더 카드 -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-5 shadow-2xl border border-emerald-500/40 text-center">
        <div class="inline-block px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-2">
          🏁 라운드 완료 리포트
        </div>

        <h2 class="text-xl font-black text-white">
          ${round.courseName}
        </h2>
        <p class="text-xs text-emerald-200/80 mb-4">
          ${round.outCourseName} / ${round.inCourseName} • ${round.date} • ${round.teeBox || '화이트'}
        </p>

        <!-- 최종 스코어 대형 숫자 -->
        <div class="bg-slate-950/60 rounded-2xl p-4 border border-emerald-500/30 max-w-xs mx-auto mb-3">
          <div class="text-xs text-slate-400 font-semibold mb-1">최종 스코어 (Total Score)</div>
          <div class="text-5xl font-black text-white tracking-tight leading-none">
            ${totalScore}
            <span class="text-xl font-bold ${overPar > 0 ? 'text-amber-400' : 'text-emerald-400'} ml-1">
              (${overParSign})
            </span>
          </div>
          <div class="flex items-center justify-center gap-4 mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-300">
            <span>전반(OUT): <strong class="text-white">${stats ? stats.front9Score : '-'}</strong></span>
            <span>|</span>
            <span>후반(IN): <strong class="text-white">${stats ? stats.back9Score : '-'}</strong></span>
          </div>
        </div>

        ${round.memo ? `
          <div class="text-xs bg-slate-900/60 rounded-xl p-2.5 text-slate-300 text-left border border-slate-800">
            <span class="font-bold text-emerald-400">📝 메모:</span> ${round.memo}
          </div>
        ` : ''}
      </div>

      <!-- 핵심 고급 지표 4대 카드 -->
      ${stats ? `
        <div class="grid grid-cols-2 gap-2.5">
          <!-- 1. 페어웨이 안착률 -->
          <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>🎯 페어웨이 안착</span>
              <span class="text-[10px] text-emerald-400 font-bold">${stats.fwHitCount}/${stats.fwEligibleCount}홀</span>
            </div>
            <div class="text-2xl font-black text-emerald-400">
              ${stats.fairwayHitPct}%
            </div>
            <div class="text-[10px] text-slate-400 mt-1">
              좌 ${stats.fwDistribution.left} • 우 ${stats.fwDistribution.right} • 짧/길 ${stats.fwDistribution.short + stats.fwDistribution.long}
            </div>
          </div>

          <!-- 2. 그린 적중률 (GIR) -->
          <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>🟢 그린 적중률 (GIR)</span>
              <span class="text-[10px] text-sky-400 font-bold">${stats.girCount}/${stats.totalHolesCount}홀</span>
            </div>
            <div class="text-2xl font-black text-sky-400">
              ${stats.girPct}%
            </div>
            <div class="text-[10px] text-slate-400 mt-1">
              스크램블링(파세이브) ${stats.scramblingPct}%
            </div>
          </div>

          <!-- 3. 퍼팅 통계 -->
          <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>⛳ 퍼팅 분석</span>
              <span class="text-[10px] text-amber-400 font-bold">홀당 ${stats.avgPutts}펏</span>
            </div>
            <div class="text-2xl font-black text-amber-400">
              ${stats.totalPutts}<span class="text-xs font-normal text-slate-400 ml-1">총 퍼트</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-1">
              1펏: ${stats.onePuttCount}회 • 3펏+: <strong class="${stats.threePlusPuttCount > 0 ? 'text-amber-300' : 'text-emerald-300'}">${stats.threePlusPuttCount}회</strong>
            </div>
          </div>

          <!-- 4. 트러블 / 리커버리 -->
          <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>⚠️ 트러블 지표</span>
              <span class="text-[10px] text-slate-400 font-bold">벌타 / 벙커</span>
            </div>
            <div class="text-2xl font-black text-rose-400">
              ${stats.totalPenalties}<span class="text-xs font-normal text-slate-400 ml-1">벌타</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-1">
              벙커 탈출: ${stats.totalBunkers}회
            </div>
          </div>
        </div>

        <!-- 스코어 분포 바 -->
        <div class="glass-card p-4 rounded-2xl border border-slate-700/60 space-y-2">
          <div class="text-xs font-bold text-slate-300">스코어 분포 (Score Breakdown)</div>
          <div class="grid grid-cols-5 gap-1.5 text-center">
            <div class="bg-rose-950/60 border border-rose-800/40 p-2 rounded-xl">
              <div class="text-[10px] text-rose-300 font-medium">버디 이상</div>
              <div class="text-lg font-black text-rose-400">${stats.scoreDistribution.birdie + stats.scoreDistribution.eagle + stats.scoreDistribution.albatross}</div>
            </div>
            <div class="bg-emerald-950/60 border border-emerald-800/40 p-2 rounded-xl">
              <div class="text-[10px] text-emerald-300 font-medium">파 (PAR)</div>
              <div class="text-lg font-black text-emerald-400">${stats.scoreDistribution.par}</div>
            </div>
            <div class="bg-blue-950/60 border border-blue-800/40 p-2 rounded-xl">
              <div class="text-[10px] text-blue-300 font-medium">보기</div>
              <div class="text-lg font-black text-blue-400">${stats.scoreDistribution.bogey}</div>
            </div>
            <div class="bg-indigo-950/60 border border-indigo-800/40 p-2 rounded-xl">
              <div class="text-[10px] text-indigo-300 font-medium">더블</div>
              <div class="text-lg font-black text-indigo-400">${stats.scoreDistribution.doubleBogey}</div>
            </div>
            <div class="bg-slate-800 border border-slate-700 p-2 rounded-xl">
              <div class="text-[10px] text-slate-300 font-medium">트리플+</div>
              <div class="text-lg font-black text-slate-400">${stats.scoreDistribution.triplePlus}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- 액션 버튼들 -->
      <div class="space-y-2 pt-2">
        <button onclick="window.appActions.openScorecardModalWithRound('${round.id}')"
                class="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow">
          <span>📊</span> 18홀 상세 스코어카드 표 보기
        </button>

        <div class="grid grid-cols-2 gap-2">
          <button onclick="window.appActions.copyRoundSummaryText('${round.id}')"
                  class="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
            <span>📋</span> 텍스트 결과 복사
          </button>
          <button onclick="window.appActions.navigate('home')"
                  class="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg">
            <span>🏠</span> 홈으로 완료
          </button>
        </div>
      </div>
    </div>
  `;
}
