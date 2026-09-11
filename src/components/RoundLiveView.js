// 필드 최적화 실시간 라운드 기록 컴포넌트
export function renderRoundLiveView(state) {
  const round = state.activeRound;
  if (!round) {
    return `
      <div class="p-8 text-center text-slate-400">
        <p>진행 중인 라운드가 없습니다.</p>
        <button onclick="window.appActions.navigate('home')" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">
          홈으로 돌아가기
        </button>
      </div>
    `;
  }

  const currentHoleIndex = state.currentHoleIndex !== undefined ? state.currentHoleIndex : 0;
  const currentHole = round.holes[currentHoleIndex] || round.holes[0];
  const par = currentHole.par || 4;
  const score = currentHole.score !== undefined ? currentHole.score : par;
  const putts = currentHole.putts !== undefined ? currentHole.putts : 2;
  const fairway = currentHole.fairway || (par === 3 ? 'none' : 'center');
  const gir = currentHole.gir !== undefined ? currentHole.gir : ((score - putts) <= (par - 2));
  const bunkerCount = currentHole.bunkerCount || 0;
  const penaltyCount = currentHole.penaltyCount || 0;
  const holeMemo = currentHole.memo || '';

  // 스코어 라벨 및 색상 계산
  const diff = score - par;
  let scoreLabel = 'PAR';
  let scoreColorClass = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
  let diffText = 'E';

  if (diff <= -3) {
    scoreLabel = 'ALBATROSS';
    scoreColorClass = 'text-purple-300 border-purple-500/50 bg-purple-950/50';
    diffText = `${diff}`;
  } else if (diff === -2) {
    scoreLabel = 'EAGLE';
    scoreColorClass = 'text-amber-300 border-amber-500/50 bg-amber-950/50';
    diffText = '-2';
  } else if (diff === -1) {
    scoreLabel = 'BIRDIE';
    scoreColorClass = 'text-rose-400 border-rose-500/50 bg-rose-950/50';
    diffText = '-1';
  } else if (diff === 0) {
    scoreLabel = 'PAR';
    scoreColorClass = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
    diffText = 'E';
  } else if (diff === 1) {
    scoreLabel = 'BOGEY';
    scoreColorClass = 'text-blue-400 border-blue-500/50 bg-blue-950/40';
    diffText = '+1';
  } else if (diff === 2) {
    scoreLabel = 'DOUBLE BOGEY';
    scoreColorClass = 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40';
    diffText = '+2';
  } else if (diff === 3) {
    scoreLabel = 'TRIPLE BOGEY';
    scoreColorClass = 'text-slate-300 border-slate-600 bg-slate-800/60';
    diffText = '+3';
  } else {
    scoreLabel = `+${diff} BOGEY`;
    scoreColorClass = 'text-slate-400 border-slate-700 bg-slate-900/60';
    diffText = `+${diff}`;
  }

  // 총 입력 타수 합계
  const totalScoreSoFar = round.holes.reduce((sum, h) => sum + (h.score || 0), 0);
  const playedHolesCount = round.holes.filter(h => h.score > 0).length;

  return `
    <div class="p-3.5 space-y-3.5 animate-fade-in pb-16">
      <!-- 1. 상단 1~18홀 가로 스크롤 탭 바 -->
      <div class="glass-card p-2 rounded-2xl border border-slate-700/60 shadow-lg">
        <div class="flex items-center justify-between px-1 mb-1.5 text-[11px] text-slate-400">
          <span>홀 선택 (${currentHoleIndex + 1} / 18홀)</span>
          <span class="text-emerald-400 font-bold">기록 완료: ${playedHolesCount}/18</span>
        </div>

        <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          ${round.holes.map((h, idx) => {
            const isSelected = idx === currentHoleIndex;
            const hScore = h.score;
            const hPar = h.par || 4;
            const hDiff = hScore ? hScore - hPar : null;

            let badgeBg = 'bg-slate-800 text-slate-400';
            if (hDiff !== null) {
              if (hDiff < 0) badgeBg = 'bg-rose-500 text-white font-bold';
              else if (hDiff === 0) badgeBg = 'bg-emerald-600 text-white font-bold';
              else if (hDiff === 1) badgeBg = 'bg-blue-600 text-white font-bold';
              else badgeBg = 'bg-slate-600 text-white';
            }

            return `
              <button onclick="window.appActions.setCurrentHole(${idx})"
                      class="flex-shrink-0 w-11 py-1.5 rounded-xl border text-center transition-all ${
                        isSelected 
                          ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/40' 
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                      }">
                <div class="text-[10px] ${isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}">
                  ${idx < 9 ? '전' : '후'}${h.holeNumber}
                </div>
                <div class="text-xs font-black my-0.5 ${badgeBg} rounded-md mx-1 py-0.5">
                  ${hScore !== undefined ? hScore : `P${hPar}`}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. 현재 홀 상세 정보 헤더 카드 -->
      <div class="glass-card p-3.5 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 shadow-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white font-black text-sm shadow">
              ${currentHoleIndex < 9 ? 'OUT' : 'IN'} ${currentHole.holeNumber}번홀
            </span>
            <div>
              <h3 class="text-sm font-bold text-white leading-tight">
                ${currentHole.subCourseName || '코스'}
              </h3>
              <span class="text-[11px] text-slate-400">핸디캡 ${currentHole.handicap || '-'} • 거리 ${currentHole.distance || '-'}m</span>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs text-slate-400 font-medium">기준 파</div>
            <div class="text-2xl font-black text-emerald-400 leading-none">
              PAR ${par}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 대형 스코어 입력 섹션 -->
      <div class="glass-card p-4 rounded-2xl border ${scoreColorClass} shadow-xl relative">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
            홀 스코어 (Score)
          </span>
          <span class="text-xs font-black px-2.5 py-0.5 rounded-full border ${scoreColorClass}">
            ${scoreLabel} (${diffText})
          </span>
        </div>

        <!-- 스코어 숫자 대형 표시 & +/- 버튼 -->
        <div class="flex items-center justify-between py-1">
          <button onclick="window.appActions.adjustHoleScore(-1)"
                  class="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-2xl font-bold text-slate-200 border border-slate-700 flex items-center justify-center shadow-md">
            －
          </button>

          <div class="text-center cursor-pointer" onclick="window.appActions.promptExactScore()">
            <div class="text-5xl font-black text-white tracking-tight leading-none">
              ${score}
            </div>
            <div class="text-[11px] text-slate-400 mt-1 font-medium">총 타수 (타수 터치로 직접입력)</div>
          </div>

          <button onclick="window.appActions.adjustHoleScore(1)"
                  class="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-2xl font-bold text-slate-200 border border-slate-700 flex items-center justify-center shadow-md">
            ＋
          </button>
        </div>

        <!-- 원터치 파 기준 프리셋 뱃지 버튼 -->
        <div class="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
          ${[
            { name: '버디', diff: -1, scoreVal: par - 1, color: 'bg-rose-600/90 hover:bg-rose-500' },
            { name: '파', diff: 0, scoreVal: par, color: 'bg-emerald-600/90 hover:bg-emerald-500' },
            { name: '보기', diff: 1, scoreVal: par + 1, color: 'bg-blue-600/90 hover:bg-blue-500' },
            { name: '더블', diff: 2, scoreVal: par + 2, color: 'bg-indigo-600/90 hover:bg-indigo-500' },
            { name: '트리플', diff: 3, scoreVal: par + 3, color: 'bg-slate-700 hover:bg-slate-600' }
          ].map(p => `
            <button onclick="window.appActions.setHoleScore(${p.scoreVal})"
                    class="py-2 rounded-xl text-xs font-bold text-white transition-all ${
                      score === p.scoreVal ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-85'
                    } ${p.color}">
              ${p.name}
              <div class="text-[10px] font-normal opacity-80">${p.scoreVal}타</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 4. 티샷 방향 선택기 (Fairway Target) -->
      <div class="glass-card p-4 rounded-2xl border border-slate-700/60 shadow-md">
        <div class="flex items-center justify-between mb-2.5">
          <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>🎯</span> 티샷 방향 / 페어웨이 결과 ${par === 3 ? '(파3 티샷 온그린)' : ''}
          </label>
          <span class="text-[11px] font-semibold text-emerald-400">
            ${fairway === 'center' ? '✅ 페어웨이 정타 안착' : (fairway === 'left' ? '⬅️ 좌측 러프/미스' : (fairway === 'right' ? '➡️ 우측 러프/미스' : (fairway === 'short' ? '⬇️ 짧음' : (fairway === 'long' ? '⬆️ 길음/막창' : (fairway === 'penalty' ? '🚫 OB / 해저드' : '파3')))))}
          </span>
        </div>

        ${par > 3 ? `
          <!-- 파4, 파5: 5방향 타겟 그리드 -->
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.appActions.setHoleFairway('left')"
                    class="fw-btn py-3 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                      fairway === 'left' ? 'active' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }">
              <span class="text-base">⬅️</span>
              <span>좌측 (Left)</span>
            </button>

            <button onclick="window.appActions.setHoleFairway('center')"
                    class="fw-btn py-3 px-2 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 ${
                      fairway === 'center' ? 'active' : 'bg-slate-800 border-slate-700 text-emerald-400'
                    }">
              <span class="text-base">🎯</span>
              <span>페어웨이 (Center)</span>
            </button>

            <button onclick="window.appActions.setHoleFairway('right')"
                    class="fw-btn py-3 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                      fairway === 'right' ? 'active' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }">
              <span class="text-base">➡️</span>
              <span>우측 (Right)</span>
            </button>

            <button onclick="window.appActions.setHoleFairway('short')"
                    class="fw-btn py-2.5 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 ${
                      fairway === 'short' ? 'active' : 'bg-slate-850 border-slate-750 text-slate-400'
                    }">
              <span>⬇️ 짧음 (Short)</span>
            </button>

            <button onclick="window.appActions.setHoleFairway('long')"
                    class="fw-btn py-2.5 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 ${
                      fairway === 'long' ? 'active' : 'bg-slate-850 border-slate-750 text-slate-400'
                    }">
              <span>⬆️ 길음 / 막창</span>
            </button>

            <button onclick="window.appActions.setHoleFairway('penalty')"
                    class="fw-btn py-2.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                      fairway === 'penalty' ? 'bg-red-600 border-red-400 text-white' : 'bg-red-950/40 border-red-900/60 text-red-400'
                    }">
              <span>🚫 OB / 해저드</span>
            </button>
          </div>
        ` : `
          <!-- 파3 홀 전용 티샷 뷰 -->
          <div class="grid grid-cols-3 gap-2">
            <button onclick="window.appActions.setHolePar3Teeshot('center')"
                    class="col-span-3 py-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 ${
                      fairway === 'center' || gir ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }">
              <span class="text-lg">🟢</span>
              <span>파3 티샷 1온 성공 (그린 적중)</span>
            </button>

            <button onclick="window.appActions.setHolePar3Teeshot('left')"
                    class="py-2.5 rounded-xl border text-xs font-medium ${fairway === 'left' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}">
              ⬅️ 좌측 미스
            </button>
            <button onclick="window.appActions.setHolePar3Teeshot('short')"
                    class="py-2.5 rounded-xl border text-xs font-medium ${fairway === 'short' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}">
              ⬇️ 짧음 (앞)
            </button>
            <button onclick="window.appActions.setHolePar3Teeshot('right')"
                    class="py-2.5 rounded-xl border text-xs font-medium ${fairway === 'right' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}">
              ➡️ 우측 미스
            </button>
          </div>
        `}
      </div>

      <!-- 5. 퍼팅 수 & 그린 적중(GIR) 입력 섹션 -->
      <div class="glass-card p-4 rounded-2xl border border-slate-700/60 shadow-md space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>⛳</span> 퍼팅 수 (Putts)
          </label>
          <!-- GIR 온그린 토글 -->
          <button onclick="window.appActions.toggleHoleGir()"
                  class="px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    gir 
                      ? 'bg-emerald-600 text-white border border-emerald-400 shadow' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }">
            <span>${gir ? '🟢' : '⚪'}</span>
            <span>그린 적중 (GIR) ${gir ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <!-- 퍼팅 수 원터치 버튼 -->
        <div class="grid grid-cols-5 gap-2">
          ${[0, 1, 2, 3, 4].map(pNum => `
            <button onclick="window.appActions.setHolePutts(${pNum})"
                    class="py-3 rounded-xl border text-base font-black transition-all ${
                      putts === pNum
                        ? (pNum >= 3 ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-105' : 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105')
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }">
              ${pNum === 4 ? '4+' : `${pNum}펏`}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 6. 트러블 / 벙커 / 벌타 카운터 -->
      <div class="grid grid-cols-2 gap-2.5">
        <!-- 벙커 -->
        <div class="glass-card p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-400 flex items-center gap-1">
              <span>🏖️</span> 벙커
            </div>
            <div class="text-[10px] text-slate-400">벙커샷 횟수</div>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="window.appActions.adjustHoleBunker(-1)"
                    class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">-</button>
            <span class="w-6 text-center font-bold text-sm text-white">${bunkerCount}</span>
            <button onclick="window.appActions.adjustHoleBunker(1)"
                    class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">+</button>
          </div>
        </div>

        <!-- 벌타 (OB / 해저드) -->
        <div class="glass-card p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-rose-400 flex items-center gap-1">
              <span>⚠️</span> 벌타
            </div>
            <div class="text-[10px] text-slate-400">OB/해저드 벌타</div>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="window.appActions.adjustHolePenalty(-1)"
                    class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">-</button>
            <span class="w-6 text-center font-bold text-sm text-white">${penaltyCount}</span>
            <button onclick="window.appActions.adjustHolePenalty(1)"
                    class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">+</button>
          </div>
        </div>
      </div>

      <!-- 7. 홀 간단 메모 입력창 -->
      <div class="glass-card p-3 rounded-2xl border border-slate-700/60">
        <input type="text" value="${holeMemo}" placeholder="📝 홀 메모 (예: 7번 아이언 핀 우측 2m, 맞바람 심함)"
               oninput="window.appActions.updateHoleMemo(this.value)"
               class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
      </div>

      <!-- 8. 하단 빠른 홀 전환 및 스코어카드 액션 바 -->
      <div class="flex items-center gap-2 pt-2">
        <button onclick="window.appActions.prevHole()" ${currentHoleIndex === 0 ? 'disabled' : ''}
                class="px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold text-xs shadow">
          ◀ 이전홀
        </button>

        <button onclick="window.appActions.openScorecardModal()"
                class="flex-1 py-3.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow">
          <span>📊</span> 스코어카드 (${totalScoreSoFar}타)
        </button>

        ${currentHoleIndex < 17 ? `
          <button onclick="window.appActions.nextHole()"
                  class="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-1 active:scale-95">
            <span>다음홀</span> <span>▶</span>
          </button>
        ` : `
          <button onclick="window.appActions.finishRound()"
                  class="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1 animate-pulse">
            <span>🏁 종료</span>
          </button>
        `}
      </div>
    </div>
  `;
}
