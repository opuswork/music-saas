import MusicScore from "./MusicScore";

// LessonPage.tsx 예시 (스텁 — 실제 렌더러 연결 전까지 빌드 통과용)
type LessonBlock = {
  type: string;
  content?: string;
  asset?: { url: string };
  practiceId?: string;
};

type LessonData = {
  title: string;
  blocks: LessonBlock[];
};

export default function LessonPage({ lessonData }: { lessonData: LessonData }) {
  return (
    <div className="flex flex-col gap-8 p-4">
      <h1 className="text-xl font-bold">{lessonData.title}</h1>

      {lessonData.blocks.map((block: LessonBlock, i: number) => {
        switch (block.type) {
          case "TEXT":
            return (
              <div key={i} className="prose max-w-none">
                {block.content}
              </div>
            );
          case "VIDEO":
            return (
              <div key={i} className="rounded border p-4 text-sm text-muted-foreground">
                Video placeholder: {block.asset?.url}
              </div>
            );
          // renderBlock 함수 내부
          case 'MUSIC_SCORE':
            return (
              <div className="my-8">
                <MusicScore
                  url={block.asset?.url ?? '/score-data/c-major-scale.xml'}
                  caption={block.content}
                />
              </div>
            );
          case "PRACTICE_TOOL":
            return (
              <div key={i} className="rounded border p-4 text-sm text-muted-foreground">
                Practice placeholder: {block.practiceId}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
