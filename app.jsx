import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  Terminal, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Power, 
  Copy, 
  FileCode,
  Smartphone,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  Users,
  Save,
  AlertCircle,
  X,
  Globe,
  Server,
  Code2,
  ExternalLink
} from 'lucide-react';

// --- UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/50 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false }) => {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:bg-emerald-300",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// --- Main Application ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [botEnabled, setBotEnabled] = useState(true);
  const [storeName, setStoreName] = useState(() => localStorage.getItem('wa_store_name') || "Premium AI Store");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('wa_api_key') || "");
  
  // Product State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('wa_products');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Smartwatch Ultra Z", price: "2.499.000", stock: 15, desc: "Layar AMOLED, Baterai 14 hari, Monitor detak jantung." },
      { id: 2, name: "Wireless Earbuds Pro", price: "899.000", stock: 42, desc: "Active Noise Cancelling, Bass mendalam, IPX7." }
    ];
  });

  // Modal & Form
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', desc: '' });

  useEffect(() => {
    localStorage.setItem('wa_products', JSON.stringify(products));
    localStorage.setItem('wa_store_name', storeName);
    localStorage.setItem('wa_api_key', apiKey);
  }, [products, storeName, apiKey]);

  // Simulation State
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: `Halo Kak! Selamat datang di ${storeName}. Ada yang bisa kami bantu seputar produk premium kami?`, time: '10:00' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateAIResponse = async (userInput) => {
    if (!botEnabled || !apiKey) {
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: "Mohon maaf Kak, silakan masukkan API Key di menu Settings untuk mengaktifkan AI.", time: "System" }]);
        }, 1000);
        return;
    };
    
    setIsTyping(true);
    const productContext = products.map(p => `- ${p.name}: Rp ${p.price} (Info: ${p.desc}, Stok: ${p.stock})`).join('\n');
    
    const systemPrompt = `
      Anda adalah AI Sales Specialist untuk "${storeName}". 
      Instruksi:
      1. Gunakan bahasa Indonesia yang sopan, gaul tapi profesional (panggil 'Kak').
      2. Fokus pada konversi penjualan.
      3. Jika stok sedikit, ingatkan pelanggan agar segera checkout.
      4. Katalog: ${productContext}
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userInput }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf Kak, terjadi kendala teknis. Coba lagi ya!";
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'bot', 
        text: aiText, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: "Gagal terhubung ke AI. Periksa koneksi/API Key.", time: "Error" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '', desc: '' });
  };

  const generatedServerCode = useMemo(() => {
    return `/**
 * PRODUCTION SERVER - ${storeName}
 * Filename: server.js
 */
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

const PRODUCTS = ${JSON.stringify(products, null, 2)};

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ WhatsApp AI is Online!'));

client.on('message', async (msg) => {
    if (msg.from.includes('@g.us')) return;

    try {
        const prompt = \`Role: Sales for ${storeName}. Product Data: \${JSON.stringify(PRODUCTS)}. User asked: \${msg.body}\`;
        const res = await axios.post(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${process.env.GEMINI_API_KEY}\`, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        await msg.reply(res.data.candidates[0].content.parts[0].text);
    } catch (e) { console.error('Error:', e.message); }
});

client.initialize();`;
  }, [storeName, products]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 animate-pulse">
            <Bot size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">WAsales.ai</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Inventori Produk', icon: Package },
            { id: 'simulator', label: 'Uji Coba AI', icon: Smartphone },
            { id: 'deployment', label: 'Deploy & Server', icon: Server },
            { id: 'settings', label: 'Pengaturan Toko', icon: Settings }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
            <Card className="bg-slate-900 text-white p-6 border-none">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Server Status</div>
                    <div className={`w-2 h-2 rounded-full ${botEnabled ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></div>
                </div>
                <div className="text-lg font-black mb-1 italic">V.2.5 STABLE</div>
                <p className="text-[10px] text-slate-400 mb-4 font-medium uppercase tracking-tighter">Running on Production Engine</p>
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/10 text-white py-2 text-xs" onClick={() => setBotEnabled(!botEnabled)}>
                    {botEnabled ? 'Stop Server' : 'Start Server'}
                </Button>
            </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10 relative bg-gradient-to-b from-white to-slate-50">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-700 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 mt-1 font-medium">Selamat datang kembali di panel kendali {storeName}.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                        <Users size={18} className="text-emerald-500" />
                        <span className="font-bold text-sm">42 Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={64} /></div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Pendapatan (Bulan Ini)</div>
                    <div className="text-3xl font-black text-slate-900">Rp 128.450.000</div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        +15.2% dari bulan lalu
                    </div>
                </Card>
                <Card className="p-8">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Chat Diproses</div>
                    <div className="text-3xl font-black text-slate-900">4,291</div>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-3 py-1 rounded-full">
                        AI Success Rate: 98.2%
                    </div>
                </Card>
                <Card className="p-8 bg-emerald-600 text-white border-none shadow-emerald-200">
                    <div className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">Produk Terlaris</div>
                    <div className="text-2xl font-black">{products[0]?.name || 'N/A'}</div>
                    <div className="mt-4 flex items-center gap-2 text-white/80 font-bold text-xs bg-white/20 w-fit px-3 py-1 rounded-full">
                        312 Transaksi
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                    <h3 className="font-black text-xl mb-6">Aktivitas Terkini</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><MessageSquare size={18} /></div>
                                <div>
                                    <div className="text-sm font-bold">Chat dari +62812****9021</div>
                                    <p className="text-xs text-slate-500 mt-0.5 italic">"Saya mau pesan yang tipe Pro..."</p>
                                    <div className="text-[10px] font-black text-emerald-600 mt-2">AI RESPONDED ✓</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-8 flex flex-col justify-center items-center text-center space-y-4 border-dashed border-2 border-slate-200">
                    <Globe size={40} className="text-slate-300" />
                    <h4 className="font-bold">Webhook Real-time</h4>
                    <p className="text-xs text-slate-500 max-w-[200px]">Hubungkan ke CRM atau Spreadsheet Anda untuk rekapan otomatis.</p>
                    <Button variant="outline" className="text-xs px-4 py-2">Hubungkan API</Button>
                </Card>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="animate-in slide-in-from-bottom-5 duration-500 space-y-10">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900">Katalog Produk</h2>
                    <p className="text-slate-500 mt-1 font-medium">Data ini digunakan AI sebagai "Knowledge Base" untuk menjawab chat.</p>
                </div>
                <Button icon={Plus} onClick={() => { setEditingProduct(null); setFormData({name:'', price:'', stock:'', desc:''}); setIsProductModalOpen(true); }}>
                    Tambah Produk
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {products.map(p => (
                    <Card key={p.id} className="p-6 flex gap-6 group hover:border-emerald-200">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors shrink-0">
                            <Package size={32} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-black text-lg text-slate-800">{p.name}</h4>
                                    <div className="text-emerald-600 font-black text-sm">Rp {p.price}</div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-slate-900"><Edit3 size={16} /></button>
                                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-1">{p.desc}</p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sisa Stok: <span className="text-slate-900">{p.stock}</span></div>
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((p.stock/50)*100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
          </div>
        )}

        {/* TAB: SIMULATOR */}
        {activeTab === 'simulator' && (
            <div className="flex gap-12 h-full items-start animate-in zoom-in-95 duration-500">
                {/* Phone Mockup */}
                <div className="w-96 h-[720px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl shrink-0 border-8 border-slate-800 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-10"></div>
                    <div className="bg-[#E4DDD6] h-full w-full rounded-[2.2rem] flex flex-col overflow-hidden relative shadow-inner">
                        {/* WA Top Bar */}
                        <div className="bg-[#075E54] p-6 pt-10 text-white flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bot size={20} /></div>
                            <div>
                                <div className="font-bold text-sm">{storeName} (AI)</div>
                                <div className="text-[10px] text-emerald-300 font-bold uppercase animate-pulse">Online</div>
                            </div>
                        </div>
                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl shadow-sm text-xs relative ${m.role === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                        {m.text}
                                        <div className="text-[8px] text-slate-400 text-right mt-1 font-bold">{m.time}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="bg-white/80 w-fit px-3 py-1 rounded-full text-[10px] italic">Sedang mengetik...</div>}
                        </div>
                        {/* Input */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const val = e.target.msg.value;
                            if(!val) return;
                            setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: val, time: 'Now' }]);
                            e.target.msg.value = '';
                            generateAIResponse(val);
                        }} className="p-3 bg-slate-50 flex items-center gap-2">
                            <input name="msg" className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs outline-none focus:ring-1 ring-emerald-500" placeholder="Tulis pesan..." />
                            <button type="submit" className="w-10 h-10 bg-[#128C7E] text-white rounded-full flex items-center justify-center"><Send size={18} /></button>
                        </form>
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="bg-emerald-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><MessageSquare size={120} /></div>
                        <h3 className="text-3xl font-black mb-4">Uji Coba Sales AI</h3>
                        <p className="text-emerald-100 text-sm leading-relaxed max-w-lg mb-8 font-medium">
                            Gunakan simulator ini untuk melatih AI. AI akan merespon berdasarkan daftar produk yang Anda masukkan. Cobalah bertanya seperti pelanggan sungguhan.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/10 rounded-3xl border border-white/10">
                                <div className="text-emerald-400 font-black text-xl">{products.length}</div>
                                <div className="text-[10px] uppercase font-bold text-emerald-200 mt-1">Produk Dikenali</div>
                            </div>
                            <div className="p-5 bg-white/10 rounded-3xl border border-white/10">
                                <div className="text-emerald-400 font-black text-xl">1.5s</div>
                                <div className="text-[10px] uppercase font-bold text-emerald-200 mt-1">Estimasi Respon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: DEPLOYMENT */}
        {activeTab === 'deployment' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-5xl font-black tracking-tighter italic">Go Live with Render</h2>
                    <p className="text-slate-500 max-w-lg mx-auto font-medium">Salin file di bawah ini untuk menjalankan server backend Anda secara permanen di cloud.</p>
                </div>

                <Card className="p-10 space-y-8 border-t-8 border-t-emerald-500">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileCode className="text-emerald-500" />
                            <span className="font-black text-sm uppercase tracking-widest">Filename: server.js</span>
                        </div>
                        <Button variant="outline" className="text-xs" onClick={() => navigator.clipboard.writeText(generatedServerCode)}>
                            <Copy size={14} /> Copy Source
                        </Button>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-3xl overflow-x-auto shadow-2xl">
                        <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{generatedServerCode}</pre>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 bg-blue-600 text-white border-none">
                        <h4 className="font-black text-xl mb-4">Deployment Steps</h4>
                        <ul className="space-y-4 text-sm font-medium text-blue-100">
                            <li className="flex gap-3">1. Install Node.js di komputer/VPS Anda.</li>
                            <li className="flex gap-3">2. npm install whatsapp-web.js axios dotenv</li>
                            <li className="flex gap-3">3. node server.js (Scan QR yang muncul)</li>
                            <li className="flex gap-3">4. Push ke GitHub & hubungkan ke Render.com</li>
                        </ul>
                    </Card>
                    <Card className="p-8 bg-white border border-slate-200">
                        <h4 className="font-black text-xl mb-4 text-slate-800">Render Config (Optional)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">Untuk menjalankan Chrome di Render, tambahkan environment variable:</p>
                        <div className="p-4 bg-slate-50 rounded-xl font-mono text-[10px] border border-slate-100">
                            PUPPETEER_EXECUTABLE_PATH: /usr/bin/google-chrome
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Store Settings</h2>
                    <p className="text-slate-500 font-medium">Konfigurasikan identitas toko dan API Key Anda.</p>
                </div>

                <Card className="p-10 space-y-8 shadow-2xl shadow-slate-200/50">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Toko Online</label>
                        <input 
                            value={storeName} 
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 ring-emerald-500 outline-none font-bold transition" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gemini API Key</label>
                        <input 
                            type="password"
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Mulai dengan AI-..."
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 ring-emerald-500 outline-none font-mono text-sm transition" 
                        />
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <AlertCircle size={12} /> Data disimpan lokal di browser Anda.
                        </div>
                    </div>
                    <Button className="w-full py-5 text-lg font-black" onClick={() => { alert('Pengaturan Disimpan!'); }}>
                        Simpan Semua Perubahan
                    </Button>
                </Card>
            </div>
        )}

      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-800">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                    <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={24} /></button>
                </div>
                <div className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 ring-emerald-500 transition outline-none font-bold"
                            placeholder="Contoh: Smart TV 4K"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                            <input 
                                type="text" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 ring-emerald-500 transition outline-none font-bold"
                                placeholder="1.000.000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok</label>
                            <input 
                                type="number" 
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 ring-emerald-500 transition outline-none font-bold"
                                placeholder="10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi AI</label>
                        <textarea 
                            value={formData.desc}
                            onChange={(e) => setFormData({...formData, desc: e.target.value})}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 ring-emerald-500 transition outline-none font-medium h-32 resize-none"
                            placeholder="Berikan info detail agar AI bisa menjawab dengan akurat..."
                        ></textarea>
                    </div>
                    <Button className="w-full py-5 text-xl font-black mt-4" onClick={handleAddProduct}>
                        Simpan ke Katalog
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Global Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}