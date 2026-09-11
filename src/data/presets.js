// 국내 골프장 정밀 코스 데이터 (대영힐스, 로드힐스, 올림픽CC 등)
export const DEFAULT_COURSES = [
  {
    id: 'course-daeyoung-hills',
    name: '대영힐스 CC',
    location: '충청북도 충주시',
    type: '27홀 대중제',
    holesCount: 27,
    subCourses: [
      {
        id: 'sub-daeyoung-cheong',
        name: '청(靑) 코스',
        holes: [
          { holeNumber: 1, par: 5, handicap: 5, distance: 480 },
          { holeNumber: 2, par: 3, handicap: 7, distance: 130 },
          { holeNumber: 3, par: 4, handicap: 3, distance: 360 },
          { holeNumber: 4, par: 5, handicap: 1, distance: 490 },
          { holeNumber: 5, par: 4, handicap: 6, distance: 350 },
          { holeNumber: 6, par: 4, handicap: 4, distance: 340 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 120 },
          { holeNumber: 8, par: 4, handicap: 8, distance: 330 },
          { holeNumber: 9, par: 4, handicap: 2, distance: 355 }
        ]
      },
      {
        id: 'sub-daeyoung-ryeok',
        name: '력(力) 코스',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 365 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 340 },
          { holeNumber: 3, par: 5, handicap: 1, distance: 510 },
          { holeNumber: 4, par: 3, handicap: 8, distance: 155 },
          { holeNumber: 5, par: 4, handicap: 5, distance: 350 },
          { holeNumber: 6, par: 5, handicap: 2, distance: 495 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 140 },
          { holeNumber: 8, par: 4, handicap: 3, distance: 345 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 355 }
        ]
      },
      {
        id: 'sub-daeyoung-mi',
        name: '미(美) 코스',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 340 },
          { holeNumber: 2, par: 4, handicap: 5, distance: 335 },
          { holeNumber: 3, par: 4, handicap: 2, distance: 360 },
          { holeNumber: 4, par: 3, handicap: 8, distance: 135 },
          { holeNumber: 5, par: 4, handicap: 6, distance: 345 },
          { holeNumber: 6, par: 5, handicap: 1, distance: 505 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 130 },
          { holeNumber: 8, par: 5, handicap: 3, distance: 490 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 345 }
        ]
      }
    ]
  },
  {
    id: 'course-lordhills',
    name: '로드힐스 CC',
    location: '강원도 춘천시',
    type: '27홀 대중제',
    holesCount: 27,
    subCourses: [
      {
        id: 'sub-lordhills-road',
        name: '로드 코스 (Road)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 5, distance: 350 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 340 },
          { holeNumber: 3, par: 5, handicap: 1, distance: 515 },
          { holeNumber: 4, par: 3, handicap: 8, distance: 155 },
          { holeNumber: 5, par: 4, handicap: 4, distance: 365 },
          { holeNumber: 6, par: 4, handicap: 3, distance: 370 },
          { holeNumber: 7, par: 5, handicap: 2, distance: 500 },
          { holeNumber: 8, par: 3, handicap: 9, distance: 140 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 345 }
        ]
      },
      {
        id: 'sub-lordhills-hill',
        name: '힐스 코스 (Hill)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 5, distance: 355 },
          { holeNumber: 2, par: 3, handicap: 8, distance: 145 },
          { holeNumber: 3, par: 4, handicap: 4, distance: 360 },
          { holeNumber: 4, par: 4, handicap: 6, distance: 345 },
          { holeNumber: 5, par: 5, handicap: 2, distance: 510 },
          { holeNumber: 6, par: 3, handicap: 9, distance: 135 },
          { holeNumber: 7, par: 4, handicap: 3, distance: 375 },
          { holeNumber: 8, par: 5, handicap: 1, distance: 520 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 340 }
        ]
      },
      {
        id: 'sub-lordhills-lake',
        name: '레이크 코스 (Lake)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 360 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 345 },
          { holeNumber: 3, par: 3, handicap: 8, distance: 150 },
          { holeNumber: 4, par: 5, handicap: 2, distance: 515 },
          { holeNumber: 5, par: 4, handicap: 5, distance: 355 },
          { holeNumber: 6, par: 5, handicap: 1, distance: 525 },
          { holeNumber: 7, par: 4, handicap: 3, distance: 370 },
          { holeNumber: 8, par: 3, handicap: 9, distance: 135 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 345 }
        ]
      }
    ]
  },
  {
    id: 'course-olympic',
    name: '올림픽 CC',
    location: '경기도 고양시',
    type: '18홀 대중제 (9홀 2회전)',
    holesCount: 18,
    subCourses: [
      {
        id: 'sub-olympic-out',
        name: 'Out 코스 (전반)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 350 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 335 },
          { holeNumber: 3, par: 3, handicap: 8, distance: 145 },
          { holeNumber: 4, par: 4, handicap: 3, distance: 365 },
          { holeNumber: 5, par: 5, handicap: 1, distance: 495 },
          { holeNumber: 6, par: 4, handicap: 5, distance: 345 },
          { holeNumber: 7, par: 4, handicap: 2, distance: 370 },
          { holeNumber: 8, par: 5, handicap: 7, distance: 485 },
          { holeNumber: 9, par: 3, handicap: 9, distance: 130 }
        ]
      },
      {
        id: 'sub-olympic-in',
        name: 'In 코스 (후반)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 350 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 335 },
          { holeNumber: 3, par: 3, handicap: 8, distance: 145 },
          { holeNumber: 4, par: 4, handicap: 3, distance: 365 },
          { holeNumber: 5, par: 5, handicap: 1, distance: 495 },
          { holeNumber: 6, par: 4, handicap: 5, distance: 345 },
          { holeNumber: 7, par: 4, handicap: 2, distance: 370 },
          { holeNumber: 8, par: 5, handicap: 7, distance: 485 },
          { holeNumber: 9, par: 3, handicap: 9, distance: 130 }
        ]
      }
    ]
  },
  {
    id: 'course-sunning-point',
    name: '써닝포인트 CC',
    location: '경기도 용인시',
    type: '18홀 대중제 (KLPGA 대회 코스)',
    holesCount: 18,
    subCourses: [
      {
        id: 'sub-sunning-sun',
        name: '썬 코스 (Sun)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 5, distance: 360 },
          { holeNumber: 2, par: 5, handicap: 1, distance: 520 },
          { holeNumber: 3, par: 3, handicap: 7, distance: 155 },
          { holeNumber: 4, par: 4, handicap: 3, distance: 375 },
          { holeNumber: 5, par: 4, handicap: 8, distance: 340 },
          { holeNumber: 6, par: 5, handicap: 2, distance: 510 },
          { holeNumber: 7, par: 4, handicap: 4, distance: 380 },
          { holeNumber: 8, par: 3, handicap: 9, distance: 145 },
          { holeNumber: 9, par: 4, handicap: 6, distance: 365 }
        ]
      },
      {
        id: 'sub-sunning-point',
        name: '포인트 코스 (Point)',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 370 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 355 },
          { holeNumber: 3, par: 3, handicap: 8, distance: 160 },
          { holeNumber: 4, par: 5, handicap: 2, distance: 530 },
          { holeNumber: 5, par: 4, handicap: 5, distance: 365 },
          { holeNumber: 6, par: 4, handicap: 1, distance: 400 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 140 },
          { holeNumber: 8, par: 5, handicap: 3, distance: 515 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 345 }
        ]
      }
    ]
  },
  {
    id: 'course-jayuro',
    name: '자유로 CC',
    location: '경기도 파주시',
    type: '27홀 대중제',
    holesCount: 27,
    subCourses: [
      {
        id: 'sub-jayuro-daehan',
        name: '대한 코스',
        holes: [
          { holeNumber: 1, par: 4, handicap: 5, distance: 360 },
          { holeNumber: 2, par: 5, handicap: 1, distance: 510 },
          { holeNumber: 3, par: 3, handicap: 7, distance: 155 },
          { holeNumber: 4, par: 4, handicap: 3, distance: 380 },
          { holeNumber: 5, par: 4, handicap: 8, distance: 340 },
          { holeNumber: 6, par: 5, handicap: 2, distance: 525 },
          { holeNumber: 7, par: 4, handicap: 4, distance: 370 },
          { holeNumber: 8, par: 3, handicap: 9, distance: 145 },
          { holeNumber: 9, par: 4, handicap: 6, distance: 355 }
        ]
      },
      {
        id: 'sub-jayuro-minguk',
        name: '민국 코스',
        holes: [
          { holeNumber: 1, par: 4, handicap: 4, distance: 365 },
          { holeNumber: 2, par: 4, handicap: 6, distance: 350 },
          { holeNumber: 3, par: 3, handicap: 8, distance: 150 },
          { holeNumber: 4, par: 5, handicap: 2, distance: 530 },
          { holeNumber: 5, par: 4, handicap: 5, distance: 360 },
          { holeNumber: 6, par: 4, handicap: 1, distance: 395 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 140 },
          { holeNumber: 8, par: 5, handicap: 3, distance: 505 },
          { holeNumber: 9, par: 4, handicap: 7, distance: 345 }
        ]
      },
      {
        id: 'sub-jayuro-tongil',
        name: '통일 코스',
        holes: [
          { holeNumber: 1, par: 5, handicap: 2, distance: 515 },
          { holeNumber: 2, par: 4, handicap: 5, distance: 355 },
          { holeNumber: 3, par: 3, handicap: 7, distance: 160 },
          { holeNumber: 4, par: 4, handicap: 1, distance: 390 },
          { holeNumber: 5, par: 4, handicap: 6, distance: 345 },
          { holeNumber: 6, par: 4, handicap: 4, distance: 375 },
          { holeNumber: 7, par: 3, handicap: 9, distance: 135 },
          { holeNumber: 8, par: 5, handicap: 3, distance: 520 },
          { holeNumber: 9, par: 4, handicap: 8, distance: 330 }
        ]
      }
    ]
  }
];
