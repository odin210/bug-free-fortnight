// 골프 라운드 및 홀별 고급 통계 계산 엔진

export const StatsCalculator = {
  // 단일 라운드 통계 계산
  calculateRoundStats: (round) => {
    if (!round || !round.holes || round.holes.length === 0) {
      return null;
    }

    const holes = round.holes.filter(h => h.score !== undefined && h.score !== null && h.score > 0);
    const totalHolesCount = holes.length;
    if (totalHolesCount === 0) return null;

    let totalScore = 0;
    let totalPar = 0;
    let totalPutts = 0;
    let totalBunkers = 0;
    let totalPenalties = 0;

    let fwEligibleCount = 0; // 파3 제외 티샷 대상 홀 수
    let fwHitCount = 0;
    const fwDistribution = {
      center: 0,
      left: 0,
      right: 0,
      short: 0,
      long: 0,
      penalty: 0
    };

    let girCount = 0;
    let scramblingEligibleCount = 0; // GIR 실패 홀 수
    let scramblingSuccessCount = 0; // GIR 실패 후 Par 이하 기록 수

    let onePuttCount = 0;
    let twoPuttCount = 0;
    let threePlusPuttCount = 0;

    const scoreDistribution = {
      albatross: 0, // <= -3
      eagle: 0,     // -2
      birdie: 0,    // -1
      par: 0,       // 0
      bogey: 0,     // +1
      doubleBogey: 0, // +2
      triplePlus: 0 // >= +3
    };

    holes.forEach(hole => {
      const par = hole.par || 4;
      const score = hole.score;
      const putts = hole.putts !== undefined && hole.putts !== null ? hole.putts : 2;
      const diff = score - par;

      totalScore += score;
      totalPar += par;
      totalPutts += putts;
      totalBunkers += (hole.bunkerCount || 0);
      totalPenalties += (hole.penaltyCount || 0);

      // 스코어 분포
      if (diff <= -3) scoreDistribution.albatross++;
      else if (diff === -2) scoreDistribution.eagle++;
      else if (diff === -1) scoreDistribution.birdie++;
      else if (diff === 0) scoreDistribution.par++;
      else if (diff === 1) scoreDistribution.bogey++;
      else if (diff === 2) scoreDistribution.doubleBogey++;
      else scoreDistribution.triplePlus++;

      // 퍼팅 분포
      if (putts === 1) onePuttCount++;
      else if (putts === 2) twoPuttCount++;
      else if (putts >= 3) threePlusPuttCount++;

      // 페어웨이 안착 (파3 제외)
      if (par > 3) {
        fwEligibleCount++;
        const fw = hole.fairway || 'center';
        if (fwDistribution[fw] !== undefined) {
          fwDistribution[fw]++;
        }
        if (fw === 'center') {
          fwHitCount++;
        }
      }

      // GIR (그린 적중 여부)
      const isGir = hole.gir !== undefined ? hole.gir : ((score - putts) <= (par - 2));
      if (isGir) {
        girCount++;
      } else {
        scramblingEligibleCount++;
        if (score <= par) {
          scramblingSuccessCount++;
        }
      }
    });

    const fairwayHitPct = fwEligibleCount > 0 ? Math.round((fwHitCount / fwEligibleCount) * 100) : 0;
    const girPct = totalHolesCount > 0 ? Math.round((girCount / totalHolesCount) * 100) : 0;
    const avgPutts = totalHolesCount > 0 ? (totalPutts / totalHolesCount).toFixed(1) : '0.0';
    const noThreePuttPct = totalHolesCount > 0 ? Math.round(((totalHolesCount - threePlusPuttCount) / totalHolesCount) * 100) : 100;
    const scramblingPct = scramblingEligibleCount > 0 ? Math.round((scramblingSuccessCount / scramblingEligibleCount) * 100) : 0;

    // 전반(Out 9) / 후반(In 9) 점수 분할
    const front9Holes = holes.slice(0, 9);
    const back9Holes = holes.slice(9, 18);

    const front9Score = front9Holes.reduce((sum, h) => sum + (h.score || 0), 0);
    const front9Par = front9Holes.reduce((sum, h) => sum + (h.par || 0), 0);
    const back9Score = back9Holes.reduce((sum, h) => sum + (h.score || 0), 0);
    const back9Par = back9Holes.reduce((sum, h) => sum + (h.par || 0), 0);

    return {
      totalScore,
      totalPar,
      overPar: totalScore - totalPar,
      totalHolesCount,
      front9Score,
      front9Par,
      front9Over: front9Score - front9Par,
      back9Score,
      back9Par,
      back9Over: back9Score - back9Par,
      // 페어웨이
      fairwayHitPct,
      fwHitCount,
      fwEligibleCount,
      fwDistribution,
      // 그린적중
      girPct,
      girCount,
      // 퍼팅
      totalPutts,
      avgPutts,
      onePuttCount,
      twoPuttCount,
      threePlusPuttCount,
      noThreePuttPct,
      // 리커버리 & 트러블
      scramblingPct,
      scramblingSuccessCount,
      scramblingEligibleCount,
      totalBunkers,
      totalPenalties,
      // 스코어 분포
      scoreDistribution
    };
  },

  // 전체 라운드 누적 통계
  calculateGlobalStats: (rounds) => {
    if (!rounds || rounds.length === 0) {
      return {
        totalRounds: 0,
        avgScore: 0,
        bestScore: 0,
        avgPutts: '0.0',
        avgFairwayPct: 0,
        avgGirPct: 0,
        avgThreePuttsPerRound: '0.0',
        scoreTrend: [],
        courseRankings: []
      };
    }

    const roundStatsList = rounds.map(r => ({
      round: r,
      stats: StatsCalculator.calculateRoundStats(r)
    })).filter(item => item.stats !== null);

    if (roundStatsList.length === 0) {
      return {
        totalRounds: 0,
        avgScore: 0,
        bestScore: 0,
        avgPutts: '0.0',
        avgFairwayPct: 0,
        avgGirPct: 0,
        avgThreePuttsPerRound: '0.0',
        scoreTrend: [],
        courseRankings: []
      };
    }

    const totalRounds = roundStatsList.length;
    const scores = roundStatsList.map(item => item.stats.totalScore);
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalRounds) * 10) / 10;
    const bestScore = Math.min(...scores);

    const totalAvgPutts = roundStatsList.reduce((sum, item) => sum + parseFloat(item.stats.avgPutts), 0) / totalRounds;
    const totalFwPct = Math.round(roundStatsList.reduce((sum, item) => sum + item.stats.fairwayHitPct, 0) / totalRounds);
    const totalGirPct = Math.round(roundStatsList.reduce((sum, item) => sum + item.stats.girPct, 0) / totalRounds);
    const totalThreePutts = roundStatsList.reduce((sum, item) => sum + item.stats.threePlusPuttCount, 0);
    const avgThreePuttsPerRound = (totalThreePutts / totalRounds).toFixed(1);

    // 스코어 추이 데이터 (날짜순 정렬)
    const scoreTrend = [...roundStatsList]
      .sort((a, b) => new Date(a.round.date).getTime() - new Date(b.round.date).getTime())
      .map(item => ({
        date: item.round.date,
        courseName: item.round.courseName,
        score: item.stats.totalScore,
        overPar: item.stats.overPar,
        putts: item.stats.totalPutts,
        fwPct: item.stats.fairwayHitPct,
        girPct: item.stats.girPct
      }));

    // 구장별 랭킹 & 통계
    const courseMap = {};
    roundStatsList.forEach(item => {
      const cId = item.round.courseId || item.round.courseName;
      if (!courseMap[cId]) {
        courseMap[cId] = {
          courseId: cId,
          courseName: item.round.courseName,
          roundsCount: 0,
          scores: [],
          puttsList: [],
          fwList: [],
          girList: []
        };
      }
      courseMap[cId].roundsCount++;
      courseMap[cId].scores.push(item.stats.totalScore);
      courseMap[cId].puttsList.push(parseFloat(item.stats.avgPutts));
      courseMap[cId].fwList.push(item.stats.fairwayHitPct);
      courseMap[cId].girList.push(item.stats.girPct);
    });

    const courseRankings = Object.values(courseMap).map(c => ({
      courseId: c.courseId,
      courseName: c.courseName,
      roundsCount: c.roundsCount,
      avgScore: Math.round((c.scores.reduce((a, b) => a + b, 0) / c.scores.length) * 10) / 10,
      bestScore: Math.min(...c.scores),
      avgPutts: (c.puttsList.reduce((a, b) => a + b, 0) / c.puttsList.length).toFixed(1),
      avgFwPct: Math.round(c.fwList.reduce((a, b) => a + b, 0) / c.fwList.length),
      avgGirPct: Math.round(c.girList.reduce((a, b) => a + b, 0) / c.girList.length)
    })).sort((a, b) => b.roundsCount - a.roundsCount || a.avgScore - b.avgScore);

    return {
      totalRounds,
      avgScore,
      bestScore,
      avgPutts: totalAvgPutts.toFixed(1),
      avgFairwayPct: totalFwPct,
      avgGirPct: totalGirPct,
      avgThreePuttsPerRound,
      scoreTrend,
      courseRankings
    };
  },

  // 특정 구장 / 특정 코스 / 홀별 누적 분석
  calculateCourseHoleStats: (rounds, targetCourseId, targetSubCourseId = null) => {
    const filteredRounds = rounds.filter(r => {
      if (targetCourseId && r.courseId !== targetCourseId && r.courseName !== targetCourseId) return false;
      return true;
    });

    const holeAccumulator = {};

    filteredRounds.forEach(round => {
      if (!round.holes) return;
      round.holes.forEach(hole => {
        if (!hole || hole.score === undefined || hole.score === null) return;
        const subId = hole.subCourseId || 'default';
        const subName = hole.subCourseName || '코스';
        const holeNum = hole.holeNumber;

        if (targetSubCourseId && subId !== targetSubCourseId) return;

        const key = `${subId}_H${holeNum}`;
        if (!holeAccumulator[key]) {
          holeAccumulator[key] = {
            subCourseId: subId,
            subCourseName: subName,
            holeNumber: holeNum,
            par: hole.par,
            handicap: hole.handicap,
            distance: hole.distance,
            playCount: 0,
            scores: [],
            putts: [],
            fwHits: 0,
            fwTotal: 0,
            girHits: 0,
            bunkers: 0,
            penalties: 0,
            scoreCounts: {
              eagle: 0,
              birdie: 0,
              par: 0,
              bogey: 0,
              doubleBogey: 0,
              triplePlus: 0
            }
          };
        }

        const hStat = holeAccumulator[key];
        hStat.playCount++;
        hStat.scores.push(hole.score);
        if (hole.putts !== undefined) hStat.putts.push(hole.putts);
        if (hole.par > 3) {
          hStat.fwTotal++;
          if (hole.fairway === 'center') hStat.fwHits++;
        }
        const isGir = hole.gir !== undefined ? hole.gir : ((hole.score - (hole.putts || 2)) <= (hole.par - 2));
        if (isGir) hStat.girHits++;
        hStat.bunkers += (hole.bunkerCount || 0);
        hStat.penalties += (hole.penaltyCount || 0);

        const diff = hole.score - hole.par;
        if (diff <= -2) hStat.scoreCounts.eagle++;
        else if (diff === -1) hStat.scoreCounts.birdie++;
        else if (diff === 0) hStat.scoreCounts.par++;
        else if (diff === 1) hStat.scoreCounts.bogey++;
        else if (diff === 2) hStat.scoreCounts.doubleBogey++;
        else hStat.scoreCounts.triplePlus++;
      });
    });

    const result = Object.values(holeAccumulator).map(h => {
      const avgScore = (h.scores.reduce((a, b) => a + b, 0) / h.playCount).toFixed(2);
      const avgPutts = h.putts.length > 0 ? (h.putts.reduce((a, b) => a + b, 0) / h.putts.length).toFixed(1) : '2.0';
      const avgOver = (parseFloat(avgScore) - h.par).toFixed(2);
      const fwPct = h.fwTotal > 0 ? Math.round((h.fwHits / h.fwTotal) * 100) : null;
      const girPct = Math.round((h.girHits / h.playCount) * 100);
      const parSavePct = Math.round(((h.scoreCounts.eagle + h.scoreCounts.birdie + h.scoreCounts.par) / h.playCount) * 100);

      return {
        ...h,
        avgScore: parseFloat(avgScore),
        avgOver: parseFloat(avgOver),
        avgPutts: parseFloat(avgPutts),
        fairwayHitPct: fwPct,
        girPct,
        parSavePct
      };
    });

    // 코스 및 홀 번호 순으로 정렬
    return result.sort((a, b) => {
      if (a.subCourseName !== b.subCourseName) {
        return a.subCourseName.localeCompare(b.subCourseName);
      }
      return a.holeNumber - b.holeNumber;
    });
  }
};
