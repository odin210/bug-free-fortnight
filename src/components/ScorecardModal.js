// 실시간 18홀 스코어카드 팝업 모달
export function renderScorecardModal(state) {
  const round = state.activeRound || state.selectedRoundDetail;
  if (!round) return '';

  const holes = round.holes || [];
  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);

  const renderNineHoleTable = (nineHoles, title, startIndex) => {
    const totalPar = nineHoles.reduce((s, h) => s + (h.par || 0), 0);
    const totalScore = nineHoles.reduce((s, h) => s + (h.score || 0), 0);
    const totalPutts = nineHoles.reduce((s, h) => s + (h.putts || 0), 0);
    const diff = totalScore > 0 ? totalScore - totalPar : 0;
    const diffSign = diff > 0 ? `+${diff}` : (diff === 0 ? 'E' : `${diff}`);

    return `
      <div class="mb-4">
        <div class="flex items-center justify-between text-xs font-bold text-slate-300 mb-1 px-1">
          <span class="text-emerald-400">${title}</span>
          <span>합계: <strong class="text-white text-sm">${totalScore}</strong> (${diffSign}) / ${totalPutts}펏</span>
        </div>
        <div class="overflow-x-auto border border-slate-700/80 rounded-xl bg-slate-900/80">
          <table class="scorecard-table">
            <thead>
              <tr>
                <th class="w-10">홀</th>
                ${nineHoles.map((h, i) => `<th>${i + 1}</th>`).join('')}
                <th class="bg-slate-800 text-white font-bold">합계</th>
              </tr>
            </thead>
            <tbody>
              <!-- PAR -->
              <tr class="text-slate-400">
                <td class="font-medium bg-slate-850">PAR</td>
                ${nineHoles.map(h => `<td>${h.par || '-'}</td>`).join('')}
                <td class="font-bold text-slate-300 bg-slate-850">${totalPar}</td>
              </tr>
              <!-- SCORE -->
              <tr class="font-black text-white">
                <td class="bg-slate-850 text-emerald-400">스코어</td>
                ${nineHoles.map((h, i) => {
                  const hScore = h.score;
                  const hPar = h.par || 4;
                  const hDiff = hScore !== undefined ? hScore - hPar : null;
                  let bg = '';
                  if (hDiff !== null) {
                    if (hDiff <= -2) bg = 'bg-amber-500 text-slate-950 font-black rounded';
                    else if (hDiff === -1) bg = 'bg-rose-500 text-white rounded';
                    else if (hDiff === 0) bg = 'bg-emerald-600/80 text-white rounded';
                    else if (hDiff === 1) bg = 'bg-blue-600/80 text-white rounded';
                    else if (hDiff >= 2) bg = 'bg-slate-700 text-slate-200 rounded';
                  }
                  return `
                    <td onclick="window.appActions.onScorecardHoleClick(${startIndex + i})" 
                        class="cursor-pointer hover:bg-slate-800">
                      <span class="inline-block px-1.5 py-0.5 ${bg}">${hScore !== undefined ? hScore : '-'}</span>
                    </td>
                  `;
                }).join('')}
                <td class="font-black text-white bg-slate-850 text-sm">${totalScore}</td>
              </tr>
              <!-- PUTTS -->
              <tr class="text-[11px] text-amber-300">
                <td class="bg-slate-850 text-slate-400">퍼트</td>
                ${nineHoles.map(h => `<td>${h.putts !== undefined ? h.putts : '-'}</td>`).join('')}
                <td class="font-bold bg-slate-850">${totalPutts}</td>
              </tr>
              <!-- FW / GIR -->
              <tr class="text-[10px] text-slate-400">
                <td class="bg-slate-850">FW/GIR</td>
                ${nineHoles.map(h => {
                  const fwSym = h.par === 3 ? '-' : (h.fairway === 'center' ? '🎯' : (h.fairway === 'left' ? '⬅️' : (h.fairway === 'right' ? '➡️' : '✕')));
                  const girSym = h.gir ? '🟢' : '⚪';
                  return `<td><span class="text-[9px]">${fwSym}</span>${girSym}</td>`;
                }).join('')}
                <td class="bg-slate-850">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const total18Score = holes.reduce((s, h) => s + (h.score || 0), 0);
  const total18Par = holes.reduce((s, h) => s + (h.par || 0), 0);
  const total18Putts = holes.reduce((s, h) => s + (h.putts || 0), 0);
  const totalDiff = total18Score - total18Par;
  const totalDiffSign = totalDiff > 0 ? `+${totalDiff}` : (totalDiff === 0 ? 'E' : `${totalDiff}`);

  return `
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fade-in"
         onclick="if(event.target === this) window.appActions.closeScorecardModal()">
      <div class="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 shadow-2xl space-y-3">
        <!-- 헤더 -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-1.5">
              <span>📊</span> ${round.courseName} 스코어카드
            </h3>
            <p class="text-xs text-slate-400">
              ${round.outCourseName || '전반'} / ${round.inCourseName || '후반'} (${round.date || '오늘'})
            </p>
          </div>
          <button onclick="window.appActions.closeScorecardModal()"
                  class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold flex items-center justify-center">
            ✕
          </button>
        </div>

        <!-- 18홀 총 스코어 요약 뱃지 -->
        <div class="bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-around text-center">
          <div>
            <div class="text-[11px] text-emerald-300">총 스코어</div>
            <div class="text-2xl font-black text-white">${total18Score}타</div>
            <div class="text-xs font-bold ${totalDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}">(${totalDiffSign})</div>
          </div>
          <div class="h-8 w-px bg-slate-700"></div>
          <div>
            <div class="text-[11px] text-amber-300">총 퍼팅수</div>
            <div class="text-2xl font-black text-amber-400">${total18Putts}펏</div>
            <div class="text-[10px] text-slate-400">홀당 ${(total18Putts / Math.max(holes.filter(h => h.score > 0).length, 1)).toFixed(1)}펏</div>
          </div>
        </div>

        <!-- 전반 9홀 표 -->
        ${renderNineHoleTable(front9, `전반: ${round.outCourseName || 'OUT 코스'}`, 0)}

        <!-- 후반 9홀 표 -->
        ${renderNineHoleTable(back9, `후반: ${round.inCourseName || 'IN 코스'}`, 9)}

        <div class="text-[11px] text-slate-400 text-center py-1">
          💡 스코어 셀을 탭하면 해당 홀의 입력 화면으로 즉시 이동합니다.
        </div>

        <!-- 닫기 버튼 -->
        <button onclick="window.appActions.closeScorecardModal()"
                class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all">
          닫기
        </button>
      </div>
    </div>
  `;
}
