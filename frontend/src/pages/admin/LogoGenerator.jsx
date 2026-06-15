import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Sparkles, Download, RefreshCw, Palette } from 'lucide-react';

const STYLES = ['Modern & Professional', 'Minimal & Clean', 'Bold & Playful', 'Elegant & Luxury', 'Tech & Futuristic'];

const DEFAULT_FORM = {
  brandName: '',
  description: '',
  colors: '#0A2E73, #FF7A1A',
  style: 'Modern & Professional',
};

export default function LogoGenerator() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [svg, setSvg] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const generate = async (e) => {
    e.preventDefault();
    if (!form.brandName.trim()) { toast.error('Brand name is required'); return; }
    setLoading(true);
    setError('');
    setSvg('');
    try {
      const { data } = await api.post('/ai/generate-logo', form);
      if (data.svg) {
        setSvg(data.svg);
        setAiGenerated(data.aiGenerated || false);
        toast.success(data.aiGenerated ? 'Logo generated with AI!' : 'Logo generated!');
      } else {
        setError('No logo data received. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.brandName.replace(/\s+/g, '-').toLowerCase()}-logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded!');
  };

  const downloadPNG = () => {
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 400);
      ctx.drawImage(img, 0, 0, 800, 400);
      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${form.brandName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        toast.success('PNG downloaded!');
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { toast.error('PNG export failed. Try SVG download instead.'); URL.revokeObjectURL(url); };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-saffron grid place-items-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Logo Generator</h1>
          <p className="text-sm text-gray-500">Generate professional logos for your brand using AI</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={generate} className="card p-6 space-y-4">
          <div>
            <label className="label">Brand Name *</label>
            <input
              className="input"
              placeholder="e.g. ApnaCart, TechNova, StyleHub"
              value={form.brandName}
              onChange={f('brandName')}
              required
            />
          </div>

          <div>
            <label className="label">Brand Description</label>
            <textarea
              className="input h-auto py-2"
              rows={2}
              placeholder="e.g. A modern e-commerce platform for Indian shoppers"
              value={form.description}
              onChange={f('description')}
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Palette size={14} /> Brand Colors
            </label>
            <input
              className="input"
              placeholder="#0A2E73, #FF7A1A"
              value={form.colors}
              onChange={f('colors')}
            />
            <p className="text-xs text-gray-400 mt-1">Enter hex codes separated by commas</p>

            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                { label: 'ApnaCart', value: '#0A2E73, #FF7A1A' },
                { label: 'Ocean', value: '#0369A1, #06B6D4' },
                { label: 'Forest', value: '#166534, #84CC16' },
                { label: 'Sunset', value: '#9D174D, #F97316' },
                { label: 'Mono', value: '#111827, #6B7280' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm({ ...form, colors: preset.value })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${form.colors === preset.value ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Logo Style</label>
            <select className="input" value={form.style} onChange={f('style')}>
              {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Logo
              </>
            )}
          </button>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </div>
          )}
        </form>

        <div className="space-y-4">
          <div className="card p-6 min-h-[280px] flex flex-col items-center justify-center bg-gray-50">
            {loading && (
              <div className="text-center space-y-3">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-sm text-gray-500">Generating your logo…</p>
              </div>
            )}

            {!loading && svg && (
              <div
                className="w-full rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm"
                dangerouslySetInnerHTML={{ __html: svg }}
                style={{ maxWidth: 400, aspectRatio: '2/1' }}
              />
            )}

            {!loading && !svg && (
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-saffron/20 grid place-items-center mx-auto">
                  <Sparkles size={28} className="text-primary/60" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Your logo will appear here</p>
                <p className="text-xs text-gray-400">Fill in the form and click Generate</p>
              </div>
            )}
          </div>

          {svg && !loading && (
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Logo ready!</p>
                  <p className="text-xs text-gray-400">
                    {aiGenerated ? '✨ Generated by Gemini AI' : '🎨 Generated with template engine'}
                  </p>
                </div>
                <button
                  onClick={generate}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadSVG}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                >
                  <Download size={14} /> SVG
                </button>
                <button
                  onClick={downloadPNG}
                  className="btn-outline flex-1 text-sm flex items-center justify-center gap-2"
                >
                  <Download size={14} /> PNG
                </button>
              </div>
            </div>
          )}

          <div className="card p-4 bg-blue-50 border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">💡 Pro tip</p>
            <p className="text-xs text-blue-600">
              Set <code className="bg-blue-100 px-1 rounded">GEMINI_API_KEY</code> in your environment variables to unlock AI-powered logo generation with custom designs tailored to your brand.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-700 mb-3">ApnaCart Brand Reference</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded" style={{ background: '#0A2E73' }} />
            <div>
              <p className="text-xs font-medium text-gray-700">Primary Blue</p>
              <p className="text-xs text-gray-400">#0A2E73</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded" style={{ background: '#FF7A1A' }} />
            <div>
              <p className="text-xs font-medium text-gray-700">Brand Orange</p>
              <p className="text-xs text-gray-400">#FF7A1A</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-white border" />
            <div>
              <p className="text-xs font-medium text-gray-700">White</p>
              <p className="text-xs text-gray-400">#FFFFFF</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 ml-auto">Use these colors when generating ApnaCart logos for consistency</p>
        </div>
      </div>
    </div>
  );
}
