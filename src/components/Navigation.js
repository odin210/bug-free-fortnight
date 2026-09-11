// 상단 헤더 컴포넌트
export function renderHeader(state, actions) {
  const activeRound = state.activeRound;
  const isPlaying = !!activeRound;

  return `
    <header class="golf-gradient-header px-4 py-3 sticky top-0 z-40 shadow-lg border-b border-emerald-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 cursor-pointer" onclick="window.appActions.navigate('home')">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            ⛳
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              골프 스코어 트래커
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700/80 text-emerald-200 font-medium">Easy & Fast</span>
            </h1>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          ${isPlaying && state.currentView !== 'liveRound' ? `
            <button onclick="window.appActions.navigate('liveRound')" 
                    class="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
              <span>●</span> 진행 중 라운드
            </button>
          ` : ''}
          <button onclick="window.appActions.navigate('courses')" title="골프장 관리"
                  class="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 text-sm">
            ⚙️ 구장
          </button>
        </div>
      </div>

      ${isPlaying && state.currentView === 'liveRound' ? `
        <div class="mt-2 pt-2 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-100">
          <span class="font-medium flex items-center gap-1">
            📍 ${activeRound.courseName} (${activeRound.outCourseName} ➔ ${activeRound.inCourseName})
          </span>
          <span class="font-bold bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-300">
            총 ${activeRound.holes.reduce((sum, h) => sum + (h.score || 0), 0)}타
          </span>
        </div>
      ` : ''}
    </header>
  `;
}

// 하단 탭 네비게이션
export function renderNavigation(state) {
  const currentView = state.currentView;
  const isPlaying = !!state.activeRound;

  const tabs = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: isPlaying ? 'liveRound' : 'newRoundSetup', icon: '⛳', label: isPlaying ? '라운드중' : '새 라운드', highlight: isPlaying },
    { id: 'history', icon: '📋', label: '기록' },
    { id: 'stats', icon: '📊', label: '통계분석' },
    { id: 'courses', icon: '🗺️', label: '골프장' }
  ];

  return `
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[540px] bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 py-1.5">
      <div class="grid grid-cols-5 gap-1">
        ${tabs.map(tab => {
          const isActive = currentView === tab.id || (tab.id === 'newRoundSetup' && currentView === 'liveRound');
          return `
            <button onclick="window.appActions.navigate('${tab.id}')"
                    class="flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                      isActive 
                        ? 'text-emerald-400 font-bold bg-emerald-950/40' 
                        : 'text-slate-400 hover:text-slate-200'
                    } ${tab.highlight ? 'text-amber-400' : ''}">
              <span class="text-lg leading-none mb-1">${tab.icon}</span>
              <span class="text-[11px]">${tab.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    </nav>
  `;
}
