import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { inr } from '../utils/format';

const STORAGE_KEY = 'apnacart_chat_v1';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      role: 'assistant',
      content: "Hi! I'm ApnaCart AI. Ask me anything — e.g. 'gaming laptop under 80000' or 'gift ideas for mom'.",
    }];
  });
  const [products, setProducts] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, products, busy]);
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/ai/chat', { messages: next });
      const reply = data?.reply || "I couldn't generate a reply, but I'm here. Try rephrasing!";
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      setProducts(Array.isArray(data?.products) ? data.products : []);
    } catch (e) {
      const detail = e?.response?.data?.message || e?.message || 'Network error';
      setError(detail);
      setMessages((m) => [...m, {
        role: 'assistant',
        content: "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
      }]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    'Show me trending laptops',
    'Phone under ₹30,000',
    'Best Diwali gifts',
    'Compare wireless earbuds',
  ];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 bg-saffron hover:bg-saffron-dark text-white rounded-full p-4 shadow-2xl ring-4 ring-saffron/20 z-40 transition"
        aria-label="Open ApnaCart AI"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 w-[380px] max-w-[95vw] h-[560px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-primary text-white">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-saffron grid place-items-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">ApnaCart AI</div>
                <div className="text-[11px] opacity-80">Your shopping assistant</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-2xl px-3 py-2 max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-primary text-white ml-auto rounded-tr-sm'
                    : 'bg-white border border-gray-200 mr-auto rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            ))}

            {products.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {products.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md hover:border-saffron transition"
                  >
                    <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded" />
                    <div className="text-xs font-medium line-clamp-2 mt-1">{p.name}</div>
                    <div className="text-sm font-bold text-primary">{inr(p.price)}</div>
                  </Link>
                ))}
              </div>
            )}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" /> ApnaCart AI is thinking…
              </div>
            )}

            {messages.length <= 1 && !busy && (
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Try asking</div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs bg-white border border-gray-200 hover:border-saffron hover:bg-saffron/5 rounded-md px-3 py-2"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-2 border-t bg-white flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any product…"
              disabled={busy}
              className="flex-1 h-10 px-3 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-saffron text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="h-10 w-10 grid place-items-center rounded-md bg-saffron text-white hover:bg-saffron-dark disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
