import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  MessageSquare, 
  Search, 
  ChevronRight, 
  FileText, 
  LayoutDashboard,
  Settings,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Save,
  Link as LinkIcon,
  Share2,
  ArrowLeft,
  Percent
} from 'lucide-react';

const INDIAN_STATES = [
  { code: "27", name: "Maharashtra" },
  { code: "07", name: "Delhi" },
  { code: "29", name: "Karnataka" },
  { code: "33", name: "Tamil Nadu" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "19", name: "West Bengal" },
];

const App = () => {
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'pdf') return 'pdf-view';
    return 'dashboard';
  };

  const [view, setView] = useState(getInitialView()); 
  
  const [businessDetails, setBusinessDetails] = useState({
    name: "Global Tech Solutions",
    gstin: "27AAACG1234A1Z5",
    address: "123, Business Park, Andheri East, Mumbai, MH - 400069",
    phone: "+91 98765 43210",
    stateCode: "27"
  });

  const [invoices, setInvoices] = useState([
    { id: 'INV-001', customer: 'Acme Corp', date: '2023-10-25', total: 15400, status: 'Paid', phone: '919876543210', customerGst: '27BBBCG1234A1Z5', items: [{ id: 1, description: 'Cloud Consulting', qty: 10, price: 1540, gst: 18 }] },
    { id: 'INV-002', customer: 'John Doe', date: '2023-10-26', total: 2500, status: 'Pending', phone: '919876543211', customerGst: '', items: [{ id: 2, description: 'Hardware Repair', qty: 1, price: 2500, gst: 18 }] },
  ]);

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateNew = () => {
    const newInv = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerPhone: '',
      customerGst: '',
      customerState: '27',
      items: [{ id: Date.now(), description: '', qty: 1, price: 0, gst: 18 }],
      notes: 'Thank you for your business!',
      status: 'Draft'
    };
    setActiveInvoice(newInv);
    setView('editor');
  };

  const saveInvoice = () => {
    const totals = calculateTotals(activeInvoice);
    const existingIdx = invoices.findIndex(inv => inv.id === activeInvoice.id);
    
    const invoiceToSave = {
      ...activeInvoice,
      customer: activeInvoice.customerName || 'Walk-in',
      total: totals.grandTotal,
      status: 'Pending'
    };

    if (existingIdx > -1) {
      const newInvoices = [...invoices];
      newInvoices[existingIdx] = invoiceToSave;
      setInvoices(newInvoices);
    } else {
      setInvoices([...invoices, invoiceToSave]);
    }
    
    setView('dashboard');
    showNotification("Invoice saved successfully!");
  };

  const calculateTotals = (inv) => {
    if (!inv) return { subtotal: 0, gst: 0, grandTotal: 0 };
    const subtotal = inv.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const gstTotal = inv.items.reduce((acc, item) => {
        const itemSubtotal = item.qty * item.price;
        return acc + (itemSubtotal * (item.gst / 100));
    }, 0);
    return {
      subtotal,
      gst: gstTotal,
      grandTotal: subtotal + gstTotal
    };
  };

  if (view === 'pdf-view') {
    const inv = activeInvoice || invoices[0];
    return (
      <div className="bg-slate-100 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-6 no-print">
           <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
             <ArrowLeft className="w-4 h-4" /> Back to Dashboard
           </button>
           <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
             <Printer className="w-4 h-4" /> Print / Save as PDF
           </button>
        </div>
        <div className="max-w-4xl mx-auto bg-white shadow-2xl p-12 min-h-[1056px]">
          <InvoiceLayout invoice={inv} businessDetails={businessDetails} totals={calculateTotals(inv)} mode="a4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex justify-between items-center no-print">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 cursor-pointer" onClick={() => setView('dashboard')}>
          <FileText className="w-8 h-8" />
          <span>GSTInvoicer</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('settings')} className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
            {businessDetails.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-6 no-print">
        {notification && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            {notification}
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            invoices={invoices} 
            onCreate={handleCreateNew} 
            onView={(inv) => { setActiveInvoice(inv); setView('editor'); }}
          />
        )}
        
        {view === 'editor' && (
          <InvoiceEditor 
            invoice={activeInvoice} 
            setInvoice={setActiveInvoice} 
            onBack={() => setView('dashboard')}
            onSave={saveInvoice}
            onOpenDirectView={() => setView('pdf-view')}
            totals={calculateTotals(activeInvoice)}
            showNotification={showNotification}
            businessDetails={businessDetails}
          />
        )}

        {view === 'settings' && (
          <SettingsView 
            details={businessDetails} 
            setDetails={setBusinessDetails} 
            onBack={() => setView('dashboard')}
            showNotification={showNotification}
          />
        )}
      </main>
    </div>
  );
};

const InvoiceLayout = ({ invoice, businessDetails, totals, mode = 'a4' }) => {
  const isThermal = mode === 'thermal';

  if (isThermal) {
    return (
      <div className="text-[10px] leading-tight text-black font-mono px-2 py-4 flex flex-col items-center">
        <div className="text-center mb-4 w-full border-b border-dashed pb-2">
          <h4 className="font-bold text-sm uppercase">{businessDetails.name}</h4>
          <p className="text-[9px] mb-1">{businessDetails.address}</p>
          <p className="font-bold">GSTIN: {businessDetails.gstin}</p>
          <p>PH: {businessDetails.phone}</p>
        </div>

        <div className="w-full mb-3 flex justify-between text-[9px] uppercase font-bold">
          <span>Inv: #{invoice.id}</span>
          <span>{invoice.date}</span>
        </div>

        <div className="w-full mb-4 pb-2 border-b border-dashed">
          <p className="text-[8px] text-slate-500 uppercase">Customer:</p>
          <p className="font-bold">{invoice.customerName || 'Walk-in'}</p>
          {invoice.customerGst && <p className="text-[8px]">GST: {invoice.customerGst}</p>}
        </div>

        <div className="w-full mb-4">
          <div className="flex justify-between font-bold border-b border-black mb-1 pb-1">
            <span>Item</span>
            <div className="flex gap-4">
              <span>Qty</span>
              <span>Total</span>
            </div>
          </div>
          {invoice.items.map((i) => (
            <div key={i.id} className="mb-2">
              <div className="font-bold uppercase text-[9px]">{i.description || 'Consultancy'}</div>
              <div className="flex justify-between italic text-[9px]">
                <span>{i.qty} x ₹{i.price.toLocaleString()} (@{i.gst}%)</span>
                <span className="font-bold">₹{(i.qty * i.price * (1 + i.gst/100)).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-black pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>GST:</span>
            <span>₹{totals.gst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-dashed pt-2">
            <span>GRAND TOTAL:</span>
            <span>₹{totals.grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 text-center w-full border-t border-dashed pt-4">
          <p className="font-bold mb-1 uppercase tracking-tighter">*** Thank You! Visit Again ***</p>
          <p className="text-[8px] text-slate-500 italic">E.& O.E. Computer Generated Invoice</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[12px] leading-relaxed text-slate-800">
      <div className="flex justify-between border-b-2 border-indigo-600 pb-6 mb-8">
        <div className="flex-1 pr-4">
          <h4 className="font-bold text-2xl text-indigo-600 break-words mb-2 leading-none">{businessDetails.name}</h4>
          <p className="text-slate-500 max-w-sm">{businessDetails.address}</p>
          <div className="mt-3 flex gap-4 text-xs font-semibold">
             <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">GSTIN: {businessDetails.gstin}</span>
             <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">PH: {businessDetails.phone}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <h2 className="text-4xl font-black uppercase text-slate-200 tracking-tighter mb-1">Tax Invoice</h2>
          <div className="space-y-1">
            <p className="font-bold text-lg">Invoice #{invoice.id}</p>
            <p className="text-slate-500 font-medium">Date: {invoice.date}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <p className="text-slate-400 font-bold uppercase text-[10px] mb-2 tracking-widest border-b pb-1 w-fit">Bill To:</p>
          <p className="font-bold text-lg text-slate-900">{invoice.customerName || 'Walk-in Customer'}</p>
          <p className="text-slate-600">{invoice.customerPhone || 'Not Provided'}</p>
          {invoice.customerGst && <p className="font-semibold text-indigo-600 mt-1">GSTIN: {invoice.customerGst}</p>}
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-bold uppercase text-[10px] mb-2 tracking-widest border-b pb-1 w-fit ml-auto">Shipping Address:</p>
          <p className="text-slate-600 italic">Same as billing address</p>
          <p className="font-medium mt-1">Place of Supply: {INDIAN_STATES.find(s => s.code === invoice.customerState)?.name || 'Maharashtra'}</p>
        </div>
      </div>

      <table className="w-full mb-10 text-left">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-3 rounded-tl-lg font-bold">#</th>
            <th className="p-3 font-bold">Description</th>
            <th className="p-3 text-center font-bold">Qty</th>
            <th className="p-3 text-right font-bold">Price</th>
            <th className="p-3 text-right font-bold">GST</th>
            <th className="p-3 text-right rounded-tr-lg font-bold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 border-x border-b">
          {invoice.items.map((i, idx) => (
            <tr key={i.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="p-3 text-slate-400">{idx + 1}</td>
              <td className="p-3 font-semibold">{i.description || 'Consultancy Service'}</td>
              <td className="p-3 text-center">{i.qty}</td>
              <td className="p-3 text-right">₹{i.price.toLocaleString()}</td>
              <td className="p-3 text-right text-slate-500">{i.gst}%</td>
              <td className="p-3 text-right font-bold">₹{(i.qty * i.price * (1 + i.gst/100)).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-80 space-y-3 bg-slate-50 p-6 rounded-xl border-2 border-slate-100">
          <div className="flex justify-between text-slate-500 font-medium"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-500 font-medium"><span>Total GST</span><span>₹{totals.gst.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-xl border-t-2 border-slate-200 pt-3 text-indigo-700"><span>Grand Total</span><span>₹{totals.grandTotal.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="text-center text-[9px] text-slate-400 mt-auto pt-8 italic border-t">
        This is a computer-generated document and does not require a physical signature.
      </div>
    </div>
  );
};

const Dashboard = ({ invoices, onCreate, onView }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-slate-500">Manage and track your business billing.</p>
        </div>
        <button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
          <Plus className="w-5 h-5" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value="₹1,24,500" icon={<CheckCircle2 className="text-green-500"/>} />
        <StatCard label="Pending" value="₹45,200" icon={<Clock className="text-amber-500"/>} />
        <StatCard label="Overdue" value="₹12,000" icon={<AlertCircle className="text-red-500"/>} />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by customer..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} onClick={() => onView(inv)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium text-indigo-600">#{inv.id}</td>
                  <td className="px-6 py-4">{inv.customer}</td>
                  <td className="px-6 py-4 text-right font-semibold">₹{inv.total.toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span></td>
                  <td className="px-6 py-4 text-right"><ChevronRight className="w-5 h-5 text-slate-300 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ details, setDetails, onBack, showNotification }) => {
  const [localDetails, setLocalDetails] = useState({ ...details });
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-indigo-600" />Business Profile</h1>
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setDetails(localDetails); showNotification("Settings saved!"); onBack(); }} className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2"><InputField label="Business Name" value={localDetails.name} onChange={(v) => setLocalDetails({ ...localDetails, name: v })} /></div>
          <InputField label="GSTIN" value={localDetails.gstin} onChange={(v) => setLocalDetails({ ...localDetails, gstin: v })} />
          <InputField label="Phone" value={localDetails.phone} onChange={(v) => setLocalDetails({ ...localDetails, phone: v })} />
          <div className="md:col-span-2"><InputField label="Address" value={localDetails.address} onChange={(v) => setLocalDetails({ ...localDetails, address: v })} /></div>
        </div>
        <div className="pt-6 border-t flex justify-end gap-3"><button type="submit" className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-semibold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button></div>
      </form>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm">
    <div><p className="text-slate-500 text-sm">{label}</p><h3 className="text-2xl font-bold mt-1">{value}</h3></div>
    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
  </div>
);

const InvoiceEditor = ({ invoice, setInvoice, onBack, onSave, onOpenDirectView, totals, showNotification, businessDetails }) => {
  const [previewMode, setPreviewMode] = useState('a4');

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, { id: Date.now(), description: '', qty: 1, price: 0, gst: 18 }] });
  };

  const updateItem = (id, field, value) => {
    setInvoice({ ...invoice, items: invoice.items.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const removeItem = (id) => {
    setInvoice({ ...invoice, items: invoice.items.filter(i => i.id !== id) });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2"><X className="w-5 h-5" /> Close</button>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => {
            const msg = `Invoice ${invoice.id}: ₹${totals.grandTotal}. View: ${window.location.origin}${window.location.pathname}?mode=pdf&id=${invoice.id}`;
            window.open(`https://wa.me/${invoice.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
          }} className="px-4 py-2 border rounded-lg hover:bg-green-50 flex items-center gap-2 transition-all"><MessageSquare className="w-4 h-4" /> WhatsApp</button>
          <button onClick={onOpenDirectView} className="px-4 py-2 border rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-all"><Share2 className="w-4 h-4" /> View PDF</button>
          <button onClick={onSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Save Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500" />Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name" value={invoice.customerName} onChange={(v) => setInvoice({...invoice, customerName: v})} />
              <InputField label="WhatsApp" value={invoice.customerPhone} onChange={(v) => setInvoice({...invoice, customerPhone: v})} />
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Items & Billing</h3>
              <button onClick={addItem} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">
                <Plus className="w-4 h-4" /> Add New Item
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header Row for Items */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                <div className="col-span-5">Item Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price (₹)</div>
                <div className="col-span-2">GST %</div>
                <div className="col-span-1"></div>
              </div>

              {invoice.items.map((item) => (
                <div key={item.id} className="relative group bg-slate-50/50 hover:bg-slate-50 p-4 md:p-2 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Description */}
                    <div className="col-span-1 md:col-span-5">
                      <label className="md:hidden block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Graphic Design Services" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    {/* Qty */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="md:hidden block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Quantity</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center" 
                        value={item.qty} 
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {/* Price */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="md:hidden block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                          value={item.price} 
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    {/* GST % */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="md:hidden block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">GST %</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                        <input 
                          type="number" 
                          placeholder="18"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center" 
                          value={item.gst} 
                          onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    {/* Remove Action */}
                    <div className="col-span-1 md:col-span-1 flex justify-end pb-2 md:pb-0">
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {invoice.items.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl text-slate-400">
                   <p>No items added. Click "Add New Item" to begin.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="sticky top-24">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-700">Live Preview</h3>
              <div className="bg-slate-200 rounded-full p-1 flex text-[10px] font-bold">
                <button onClick={() => setPreviewMode('a4')} className={`px-3 py-1 rounded-full transition-all ${previewMode === 'a4' ? 'bg-white shadow' : 'text-slate-500'}`}>A4</button>
                <button onClick={() => setPreviewMode('thermal')} className={`px-3 py-1 rounded-full transition-all ${previewMode === 'thermal' ? 'bg-white shadow' : 'text-slate-500'}`}>80MM</button>
              </div>
            </div>
            
            <div className={`bg-white shadow-2xl border transition-all duration-300 ${previewMode === 'thermal' ? 'w-[280px] mx-auto overflow-y-auto max-h-[500px]' : 'w-full min-h-[400px] p-6'} rounded-lg`}>
              <InvoiceLayout invoice={invoice} businessDetails={businessDetails} totals={totals} mode={previewMode} />
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center bg-slate-100 py-2 rounded-lg border border-slate-200 font-medium">
              Real-time calculation enabled for GST & Totals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{label}</label>
    <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default App;
