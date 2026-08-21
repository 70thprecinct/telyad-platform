'use client';
import { useEffect, useRef, useState } from 'react';

// ── Lightweight, local emoji picker (no external package) ────────────────────
// Search · categories · insert-at-cursor · keyboard-safe (Escape) · outside-click
// close. Curated set keeps the bundle tiny.

interface Cat {
  id: string;
  icon: string;
  label: string;
  emojis: { e: string; n: string }[];
}
const g = (s: string) => s.split(' ');
const CATS: Cat[] = [
  { id: 'smileys', icon: '😀', label: 'Smileys', emojis: [
    ...g('😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😍 🥰 😘 😎 🤩 🥳 🤗 🤔 🙌 👏 🙏 💪 👍 👎 🔥 ✨ ⭐ 💯 ✅').map((e) => ({ e, n: 'smiley' })),
  ] },
  { id: 'people', icon: '🧑', label: 'People', emojis: g('👋 🤝 🫶 👀 🧠 🗣️ 🧑‍💻 👨‍👩‍👧 👶 🧓 🏃 🕺 💃 🙋 🙆 🤷 👑').map((e) => ({ e, n: 'people' })) },
  { id: 'sport', icon: '⚽', label: 'Sports', emojis: g('⚽ 🏀 🏈 ⚾ 🎾 🏆 🥇 🥈 🥉 🎯 🎮 🕹️ 🎲 🎳 🏅 🎽 ⛳ 🏸').map((e) => ({ e, n: 'sport' })) },
  { id: 'money', icon: '💰', label: 'Money', emojis: g('💰 💵 💸 💳 🪙 🤑 🎁 🏷️ 💎 🧧 📈 📉 💹 🏦').map((e) => ({ e, n: 'money' })) },
  { id: 'music', icon: '🎵', label: 'Music', emojis: g('🎵 🎶 🎧 🎤 🎸 🥁 🎹 🎷 🎺 📻 🔊 📱').map((e) => ({ e, n: 'music' })) },
  { id: 'objects', icon: '📱', label: 'Objects', emojis: g('📱 📲 💬 📣 📢 🔔 ⏰ 📅 📌 🔑 🎟️ 🏁 🚀 ⚡ 🌟 💡 📰 🎬 🍔 🛒').map((e) => ({ e, n: 'object' })) },
  { id: 'symbols', icon: '❤️', label: 'Symbols', emojis: g('❤️ 🧡 💛 💚 💙 💜 ✔️ ➡️ ⬆️ ⬇️ ⚠️ ‼️ ❓ ❗ 🆕 🆓 🔝 ➕').map((e) => ({ e, n: 'symbol' })) },
];
const ALL = CATS.flatMap((c) => c.emojis.map((x) => ({ ...x, cat: c.id })));

export function EmojiField({
  value,
  onChange,
  multiline = false,
  maxLength,
  placeholder,
  rows = 3,
  'data-testid': testId,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  'data-testid'?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('smileys');
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function insert(emoji: string) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    let next = value.slice(0, start) + emoji + value.slice(end);
    if (maxLength && next.length > maxLength) next = next.slice(0, maxLength);
    onChange(next);
    setOpen(false);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = Math.min(start + emoji.length, next.length);
      el.setSelectionRange(pos, pos);
    });
  }

  const list = q.trim()
    ? ALL.filter((x) => x.n.includes(q.toLowerCase()) || x.e === q.trim())
    : CATS.find((c) => c.id === cat)!.emojis;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {multiline ? (
        <textarea
          ref={ref}
          className="tly-input"
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          style={{ width: '100%', paddingRight: 36, resize: 'vertical' }}
        />
      ) : (
        <input
          ref={ref}
          className="tly-input"
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          style={{ width: '100%', paddingRight: 36 }}
        />
      )}
      <button
        type="button"
        aria-label="Insert emoji"
        onClick={() => setOpen((o) => !o)}
        data-testid={testId ? `${testId}-emoji` : 'emoji-trigger'}
        style={{
          position: 'absolute', right: 8, top: multiline ? 8 : '50%',
          transform: multiline ? 'none' : 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.7, lineHeight: 1,
        }}
      >
        😊
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Emoji picker"
          style={{
            position: 'absolute', zIndex: 50, right: 0, top: 'calc(100% + 4px)', width: 300,
            background: 'var(--tly-card, #fff)', border: '1px solid var(--tly-border)',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.15)', overflow: 'hidden',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid var(--tly-border-soft)' }}>
            <input
              autoFocus
              className="tly-input"
              placeholder="Search emoji…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="emoji-search"
              style={{ width: '100%', fontSize: 12 }}
            />
          </div>
          {!q.trim() && (
            <div style={{ display: 'flex', gap: 2, padding: '6px 8px 0', overflowX: 'auto' }}>
              {CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  title={c.label}
                  style={{
                    flexShrink: 0, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 15, background: cat === c.id ? 'var(--tly-primary-dim)' : 'transparent',
                  }}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, padding: '6px 6px 8px', maxHeight: 200, overflowY: 'auto' }}>
            {list.map((x, i) => (
              <button
                key={`${x.e}-${i}`}
                type="button"
                onClick={() => insert(x.e)}
                title={x.n}
                data-testid="emoji-opt"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}
              >
                {x.e}
              </button>
            ))}
            {list.length === 0 && <div className="tly-faint" style={{ padding: 12, fontSize: 12 }}>No emoji found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
