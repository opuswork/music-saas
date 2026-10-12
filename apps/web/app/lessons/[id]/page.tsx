// app/lessons/[id]/page.tsx
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // A Plugin to allow html tags
import PracticeSection from '@/components/PracticeSection';
import AudioPlayer from '@/components/AudioPlayer';
// Client-only, lazy-loaded score renderer (see MusicScoreClient for why it lives in a client file)
import MusicScore from '@/components/MusicScoreClient';
import {
  extractYouTubeId,
  isLikelyMusicXml,
  parsePracticeJsonArray,
} from '@/lib/lessonBlockMedia';

/** Replace old labels/classes in lesson content with KEY NOTES / key-notes-header */
function replaceKeyTakeawaysWithKeyNotes(content: string): string {
  return content
    .replace(/key\s+takeaways/gi, 'KEY NOTES')
    .replace(/key-takeaways-header/gi, 'key-notes-header');
}

function hasHtmlTags(content: string): boolean {
  return /<([a-z][\w-]*)(\s|>)/i.test(content);
}

function practiceInlineFromContent(content: string): unknown[] | undefined {
  const arr = parsePracticeJsonArray(content);
  return arr ?? undefined;
}

// 1. Block rendering function
function renderBlock(block: any) {
  const type = String(block?.type ?? '')
    .trim()
    .toUpperCase();
  switch (type) {
    case 'TEXT':
      const textContent = replaceKeyTakeawaysWithKeyNotes(String(block.content ?? ''));
      return (
        <div className="prose prose-lg prose-slate max-w-full min-w-0 break-words overflow-x-hidden
                        prose-headings:font-serif prose-headings:border-b prose-headings:pb-4 
                        prose-p:leading-relaxed text-gray-800
                        /* --- Key Notes box-specific style --- */
                        [&_.key-notes-box]:bg-[#006A51] 
                        [&_.key-notes-box]:rounded-lg 
                        [&_.key-notes-box]:pt-[10px] 
                        [&_.key-notes-box]:pb-8 
                        [&_.key-notes-box]:px-4 
                        md:[&_.key-notes-box]:px-8 
                        [&_.key-notes-box]:mt-4 
                        md:[&_.key-notes-box]:mt-10 
                        [&_.key-notes-box]:mb-10 
                        [&_*:has(+_.key-notes-box)]:mb-0 
                        [&_.key-notes-box]:shadow-sm
                        /* Header style */
                        [&_.key-notes-header]:text-[#FFFF00] 
                        [&_.key-notes-header]:font-bold 
                        [&_.key-notes-header]:text-sm 
                        [&_.key-notes-header]:uppercase 
                        [&_.key-notes-header]:tracking-widest 
                        [&_.key-notes-header]:mb-4
                        /* List style */
                        [&_.key-notes-box_ul]:list-disc 
                        [&_.key-notes-box_ul]:ml-6 
                        [&_.key-notes-box_ul]:mt-4
                        [&_.key-notes-box_li]:mb-3 
                        [&_.key-notes-box_li]:text-[#ffffff]">
          {hasHtmlTags(textContent) ? (
            <div
              className="[&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:mb-6 [&_h1]:mt-4
                         [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:mb-4 [&_h2]:mt-6
                         [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:mb-3 [&_h3]:mt-6
                         [&_p]:my-3 [&_p]:leading-relaxed
                         [&_hr]:my-6 [&_hr]:border-gray-200
                         [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                         [&_ul_ul]:list-[circle] [&_ul_ul]:pl-6 [&_ul_ul]:my-2
                         [&_li]:my-2
                         [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto"
              dangerouslySetInnerHTML={{ __html: textContent }}
            />
          ) : (
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {textContent}
            </ReactMarkdown>
          )}
        </div>
      );

  case 'IMAGE': {
    const imageUrl = String(block.asset?.url || block.content || '').trim();
    const contentStr = String(block.content ?? '').trim();
    const showCaption = contentStr && contentStr !== imageUrl;
    return (
      <div className="my-4 p-4 md:my-12 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 text-center">
        <img
          src={imageUrl}
          alt="Lesson Illustration"
          className="mx-auto max-w-full h-auto rounded-lg shadow-sm"
        />
        {showCaption ? (
          <p className="text-sm text-gray-500 mt-4 font-medium italic">{contentStr}</p>
        ) : null}
      </div>
    );
  }

  case 'VIDEO': {
    const src = String(block.content ?? '').trim();
    const vid = extractYouTubeId(src);
    if (!vid) {
      return (
        <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add a valid YouTube URL in this block&apos;s content (watch, embed, or youtu.be link).
        </div>
      );
    }
    return (
      <div className="my-8 w-full max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-black">
        <iframe
          title="YouTube lesson video"
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${vid}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  case 'PDF': {
    const pdfSrc = String(block.content ?? '').trim();
    if (!pdfSrc) {
      return (
        <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Add a PDF URL in this block&apos;s content.
        </div>
      );
    }
    return (
      <div className="my-8 w-full min-h-[70vh] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-inner">
        <iframe title="Lesson PDF" className="h-[70vh] w-full" src={pdfSrc} />
      </div>
    );
  }

  case 'QUIZ': {
    const raw = String(block.content ?? '').trim();
    return (
      <div className="my-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-2">Quiz</p>
        <p className="text-sm text-gray-500 mb-4">
          Quiz format is not finalized yet. Raw content below (JSON or text) will display here.
        </p>
        {raw ? (
          <pre className="max-h-[480px] overflow-auto rounded-lg bg-slate-900 p-4 text-left text-xs text-slate-100 whitespace-pre-wrap">
            {raw}
          </pre>
        ) : (
          <p className="text-sm text-gray-400 italic">No quiz content yet.</p>
        )}
      </div>
    );
  }

  case 'MUSIC_SCORE': {
    const raw = String(block.content ?? '').trim();
    const assetUrl = block.asset?.url?.trim();
    if (isLikelyMusicXml(raw)) {
      return (
        <div className="my-12 w-full min-w-0 max-w-full">
          <MusicScore xml={raw} />
        </div>
      );
    }
    if (assetUrl) {
      return (
        <div className="my-12 w-full min-w-0 max-w-full">
          <MusicScore
            url={assetUrl}
            caption={raw && !isLikelyMusicXml(raw) ? raw : undefined}
          />
        </div>
      );
    }
    return (
      <div className="text-gray-400 text-center p-4 italic">
        Score data not found. Paste MusicXML into the block content, or set an asset URL for a
        hosted .xml file.
      </div>
    );
  }

  case 'PRACTICE_TOOL': {
    const pid = String(block.practiceId ?? '').trim();
    if (!pid) {
      return (
        <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Practice ID is required for practice blocks (e.g. p1, p7).
        </div>
      );
    }
    const inline = practiceInlineFromContent(String(block.content ?? ''));
    return (
      <PracticeSection
        key={block.id}
        practiceId={pid}
        inlineProblems={inline as any}
      />
    );
  }

  case 'AUDIO': {
    // Priority: asset.url -> block.url -> block.content
    const audioSrc = (block.asset?.url || block.url || block.content || '').trim();

    console.log('🎵 [Server log] Check audio block data:', {
      id: block.id,
      foundSrc: audioSrc,
      hasAsset: !!block.asset,
      assetUrl: block.asset?.url,
    });

    if (!audioSrc) {
      return (
        <div className="my-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          Audio path not found. (Need to check url or asset.url in DB)
        </div>
      );
    }

    return (
      <AudioPlayer
        key={block.id}
        src={audioSrc}
        title="Listen to the Example starting at 0:10"
      />
    );
  }

  default:
      return null;
  }
}

/**
 * Nest `GET /api/lessons/:id` to get the lesson content.
 * - Default is `127.0.0.1`(to mitigate browser address vs SSR fetch's `localhost` IPv6/IPv4 mismatch).
 * - If 200 but content is empty, try `localhost` again (for other sockets/proxies).
 * Empty 200 content usually means **not a port collision**, but rather **another program responding** on that port or a wrong proxy is attached.
 */
async function fetchLessonResponseText(id: string) {
  // LESSONS_API_BASE_URL may be origin only (http://api:4000) or already include /api — avoid /api/api/lessons
  const raw =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, '') || 'http://music-saas-api:4000';
  const base = raw.endsWith('/api') ? raw : `${raw}/api`;
  const url = `${base}/lessons/${id}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();

    if (!res.ok) {
      throw new Error(`Lesson API ${res.status}: ${text.trim().slice(0, 300)} — ${url}`);
    }

    return { text, apiBase: base };
  } catch (error: unknown) {
    // Including the current attempted URL in the error message makes debugging much easier.
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Fetch failed for URL: ${url}. Error: ${message}`);
  }
}

// 2. Main page component
export default async function LessonPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Next.js 15 response: handle params being a Promise
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let apiBaseForUi =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3001';

  try {
    const { text, apiBase } = await fetchLessonResponseText(id);
    apiBaseForUi = apiBase;

    type LessonPayload = { title?: string; blocks?: unknown };
    let lesson: LessonPayload;
    try {
      lesson = JSON.parse(text) as LessonPayload;
    } catch {
      throw new Error(
        `Lesson API returned non-JSON (first 200 chars): ${text.slice(0, 200)}`
      );
    }

    // 🌟 [Core code] Safety mechanism for blocks coming as a string
    if (lesson && typeof lesson.blocks === 'string') {
      try {
        lesson.blocks = JSON.parse(lesson.blocks);
      } catch (e) {
        console.error("blocks parsing failed:", e);
        lesson.blocks = []; // Initialize with empty array if parsing fails
      }
    }
  
    // 🌟 [Data structure error prevention] Final verification
    if (!lesson || !lesson.blocks || !Array.isArray(lesson.blocks)) {
      return (
        <div className="p-20 text-center">
          <h1 className="text-xl font-bold text-red-500">Data structure error</h1>
          <p className="text-gray-500">The blocks data received from the server is not an array.</p>
          <pre className="mt-4 text-xs bg-gray-100 p-2 text-left">
            {JSON.stringify(lesson, null, 2)} {/* See what actual data is coming */}
          </pre>
        </div>
      );
    }

    return (
      <div
        className={
          'min-h-screen bg-gray-50 box-border w-full max-w-[100vw] overflow-x-hidden ' +
          /* 412×915 etc: left/right 5px, prevent horizontal scroll */
          'px-[5px] py-0 ' +
          /* 768×1024: original px-4(16px) ≈ 30% → 5px */
          'md:px-[5px] md:py-12 ' +
          /* Large screens: keep original margin */
          'lg:px-4'
        }
      >
        <article
          className={
            'max-w-4xl mx-auto w-full min-w-0 box-border bg-white shadow-2xl min-h-[80vh] font-serif border border-gray-100 rounded-sm ' +
            /* 412 etc: outer only 5px — inner left/right 0 to fill */
            'px-0 py-0 ' +
            /* 768~1023: original p-12(48px) left/right ≈ 30% → 14~15px */
            'md:px-[15px] md:py-12 ' +
            'lg:p-12 ' +
            '[&_.lesson-block]:min-w-0 [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto'
          }
        >
          <header className="border-b-4 border-black mb-4 pb-4 md:pb-8 px-[10px] md:mb-12 md:px-0">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 font-sans font-semibold">
              Music Theory / Chapter
            </p>
            <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight break-words">
              {lesson.title}
            </h1>
          </header>

          <main className="space-y-4 md:space-y-20 px-[10px] md:px-0">
            {lesson.blocks.map((block: any) => (
              <section key={block.id} className="lesson-block transition-all duration-500">
                {renderBlock(block)}
              </section>
            ))}
          </main>
          
          <footer className="mt-20 pt-8 border-t border-gray-100 text-gray-400 text-sm font-sans">
            © 2026 Interactive Music SaaS Platform
          </footer>
        </article>
      </div>
    );
  } catch (error) {
    console.error('Fetch/Parse Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error while loading lesson.';
    return (
      <div className="p-20 text-center max-w-2xl mx-auto">
        <h1 className="text-red-500 font-bold text-2xl">Something went wrong</h1>
        <p className="text-gray-600 mt-4 text-left bg-gray-50 border border-gray-200 rounded p-4 text-sm font-mono whitespace-pre-wrap">
          {message}
        </p>
        <p className="text-gray-500 mt-4 text-sm">
          Nest API returns JSON body from{' '}
          <code className="bg-gray-100 px-1 rounded">{apiBaseForUi}/api/lessons/&lt;id&gt;</code> 
          checks if it returns JSON body. In Docker·WSL, make sure{' '}
          <code className="bg-gray-100 px-1 rounded">LESSONS_API_BASE_URL</code>
          (e.g. Nest container hostname) matches. Empty 200 usually means a port collision, but often it's because <strong>another process is running on 3001</strong> — use <code className="bg-gray-100 px-1 rounded">curl -i</code> to check the response body.
        </p>
      </div>
    );
  }
}