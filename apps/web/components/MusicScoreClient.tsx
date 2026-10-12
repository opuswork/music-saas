'use client';

import dynamic from 'next/dynamic';

// 서버 컴포넌트에서 next/dynamic을 쓰면 코드 분할이 되지 않아 OSMD(~1.2MB)가 첫 로딩에 포함됩니다.
// 클라이언트 컴포넌트 안에서 dynamic import 해야 악보가 실제로 렌더될 때만 내려받습니다.
const MusicScore = dynamic(() => import('./MusicScore'), {
  ssr: false,
  loading: () => <p className="text-center p-10 text-gray-400">악보 데이터를 불러오는 중...</p>,
});

export default MusicScore;
