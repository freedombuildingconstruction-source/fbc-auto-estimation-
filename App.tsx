import React, { useState, useEffect, useRef } from 'react';
import { Download, Trash2, Plus, Camera, Send, FileText, Loader2, CheckCircle, Share2, Copy, Mail, X, Drill } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  CATEGORIES, 
  TRANSLATIONS, 
  MINOR_BATH_OPTIONS, 
  MAJOR_BATH_ITEMS, 
  LABOUR_RATES,
  STANDARD_PACKAGE_RATE
} from './constants';
import { 
  LineItem, 
  ClientDetails, 
  Language, 
  CategoryId 
} from './types';
import { DarkInput, DarkSelect, DarkTextarea, OrangeButton, CheckboxGroup } from './components/Shared';

const REF_NUMBER = `FBC-${new Date().getDate()}${new Date().getMonth() + 1}-${Math.floor(Math.random() * 99)}`;
const GST_RATE = 0.10;

// Custom Logo Component mimicking the uploaded image
// Green circle style
const FBCLogo = () => (
  <div className="relative w-[72px] h-[72px] rounded-full bg-[#8dc63f] flex items-center justify-center shrink-0 shadow-sm border border-green-600/10">
    <div className="w-[58px] h-[58px] rounded-full bg-white flex items-center justify-center relative">
       {/* Letter F */}
       <span className="font-sans font-normal text-black text-[38px] leading-none absolute left-[15px] top-[11px] select-none">F</span>
       {/* Drill Icon */}
       <Drill size={20} className="text-black absolute left-[30px] top-[24px]" strokeWidth={1.5} />
    </div>
  </div>
);

// Helper to process files to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function App() {
  // State
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<CategoryId>('minor-bath');
  const [items, setItems] = useState<LineItem[]>([]);
  const [client, setClient] = useState<ClientDetails>({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  
  // Validation State
  const [clientErrors, setClientErrors] = useState({ name: false, email: false });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [quoteData, setQuoteData] = useState({ subject: '', body: '' });
  const [copyStatus, setCopyStatus] = useState(false);

  // Local Form States
  const [minorBathForm, setMinorBathForm] = useState({ type: MINOR_BATH_OPTIONS[0].id, qty: 1, scanning: false });
  const [handrailForm, setHandrailForm] = useState({ type: 'wall', location: 'indoor', len: '', qty: 1 });
  const [rampForm, setRampForm] = useState({ type: 'merbau', len: '', ground: 'concrete', photos: [] as string[] });
  const [rampRailForm, setRampRailForm] = useState({ len: '', sides: 'one' });
  const [majorBathForm, setMajorBathForm] = useState({ 
    len: '', width: '', height: '', 
    selectedItems: [] as string[]
  });
  const [maintForm, setMaintForm] = useState({ desc: '', duration: '1', inspection: false });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear form errors when tab changes
  useEffect(() => {
    setFormErrors({});
  }, [activeTab]);

  // Helper text translator
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const formatCurrency = (val: number) => `$${val.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- Handlers ---

  const addItem = (item: LineItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('quote-summary');
    if (!input) return;
    
    try {
      // Temporarily hide delete buttons if any in summary (though currently there aren't any for items directly)
      const canvas = await html2canvas(input, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true // Important for images if they come from external (though here they are base64)
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quote-${REF_NUMBER}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
      alert("Could not generate PDF. Please try again.");
    }
  };

  // Photo Handlers
  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const newPhotos = await Promise.all(
          (Array.from(e.dataTransfer.files) as File[])
            .filter(file => file.type.startsWith('image/'))
            .map(fileToBase64)
        );
        setRampForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      } catch (err) {
        console.error("Error reading files", err);
      }
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const newPhotos = await Promise.all(
          (Array.from(e.target.files) as File[])
             .filter(file => file.type.startsWith('image/'))
             .map(fileToBase64)
        );
        setRampForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      } catch (err) {
        console.error("Error reading files", err);
      }
    }
    // Reset input so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setRampForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  // Generate the quote content but don't send it yet
  const prepareQuoteData = () => {
    // Calculate totals for email body
    const subtotal = items.reduce((sum, item) => sum + item.unitPriceEx * item.quantity, 0); 
    const gstTotal = subtotal * GST_RATE;
    const grandTotal = subtotal + gstTotal;

    // Construct Email Subject & Body
    const subject = `Quote Request: ${client.name} (${REF_NUMBER})`;
    
    let body = `New Quote Request\n\n`;
    body += `CLIENT: ${client.name}\n`;
    body += `EMAIL: ${client.email}\n`;
    body += `PHONE: ${client.phone || 'N/A'}\n`;
    body += `ADDR: ${client.address || 'N/A'}\n`;
    body += `REF: ${REF_NUMBER}\n\n`;
    
    body += `SUMMARY:\n`;
    
    // Group items by category for cleaner email
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.categoryId]) acc[item.categoryId] = [];
      acc[item.categoryId].push(item);
      return acc;
    }, {} as Record<string, LineItem[]>);

    Object.keys(grouped).forEach(catId => {
       const catDef = CATEGORIES.find(c => c.id === catId);
       const catName = catDef ? catDef.labelEn : catId;
       body += `--- ${catName.toUpperCase()} ---\n`;
       grouped[catId].forEach(item => {
          body += `* ${item.description}`;
          if (item.details) body += ` [${item.details}]`;
          body += `\n  Qty: ${item.quantity} | Total: ${formatCurrency(item.totalPriceInc)}\n`;
          if (item.images && item.images.length > 0) {
            body += `  [Attached ${item.images.length} photo(s)]\n`;
          }
       });
       body += `\n`;
    });
    
    body += `Total (Inc GST): ${formatCurrency(grandTotal)}\n\n`;
    body += `[Please attach high-res site photos manually if not included above]`;

    return { subject, body };
  };

  const handleShareClick = () => {
    if (items.length === 0) {
      alert("Please add items to the quote first.");
      return;
    }
    
    const errors = {
        name: !client.name.trim(),
        email: !client.email.trim()
    };

    if (errors.name || errors.email) {
        setClientErrors(errors);
        alert("Please provide Case Manager/Company Name and Email (highlighted fields).");
        return;
    }
    setClientErrors({ name: false, email: false });

    const data = prepareQuoteData();
    setQuoteData(data);
    setCopyStatus(false);
    setShowShareModal(true);
  };

  // Modal Actions
  const handleOpenGmail = () => {
    // Gmail web interface often handles longer URLs better, but still has limits
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=freedombuildingconstruction@gmail.com&su=${encodeURIComponent(quoteData.subject)}&body=${encodeURIComponent(quoteData.body)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quoteData.subject,
          text: quoteData.body,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(quoteData.body);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 3000);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy. Please select text manually.");
    }
  };

  // --- Category Specific Add Handlers ---

  const addMinorBath = () => {
    const opt = MINOR_BATH_OPTIONS.find(o => o.id === minorBathForm.type);
    if (!opt) return;
    
    // Calculate Main Item Price (Scanning fee is separate now)
    const baseTotalEx = opt.priceEx * minorBathForm.qty;
    const totalInc = baseTotalEx * (1 + GST_RATE);

    const newItems: LineItem[] = [];

    // 1. Add the main item
    newItems.push({
      id: Date.now().toString(),
      categoryId: 'minor-bath',
      description: opt.label,
      descriptionZh: TRANSLATIONS[opt.id]?.zh || opt.label, // Attempt to get stored translation or fallback
      quantity: minorBathForm.qty,
      unitPriceEx: opt.priceEx,
      totalPriceInc: totalInc
    });

    // 2. Add Scanning Fee if checked and NOT already in list
    if (minorBathForm.scanning) {
        const scanningFeeId = 'wall-scanning-fee';
        const feeExists = items.some(i => i.id === scanningFeeId);

        if (!feeExists) {
            const feeEx = LABOUR_RATES.wallScanning;
            const feeInc = feeEx * (1 + GST_RATE);
            newItems.push({
                id: scanningFeeId,
                categoryId: 'minor-bath',
                description: 'Wall Scanning Fee',
                descriptionZh: '牆壁掃描費',
                quantity: 1,
                unitPriceEx: feeEx,
                totalPriceInc: feeInc
            });
        }
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const addHandrail = () => {
    const len = parseFloat(handrailForm.len) || 0;
    
    if (len <= 0) {
        setFormErrors({ ...formErrors, len: true });
        return;
    }
    setFormErrors({});

    let rate = 370; // Wall default
    let minLen = 0.5;
    
    if (handrailForm.type === 'stair') {
      rate = 500;
      minLen = 0.8;
    }

    const effectiveLen = Math.max(len, minLen);
    
    const priceEx = effectiveLen * rate;
    const totalEx = priceEx * handrailForm.qty;
    const totalInc = totalEx * (1 + GST_RATE);

    const typeLabel = handrailForm.type === 'wall' ? 'Wall Mount' : 'Stair';
    const typeLabelZh = handrailForm.type === 'wall' ? '壁掛式' : '樓梯';
    const locLabel = handrailForm.location === 'indoor' ? 'Indoor' : 'Outdoor';
    const locLabelZh = handrailForm.location === 'indoor' ? '室內' : '戶外';

    addItem({
      id: Date.now().toString(),
      categoryId: 'handrail',
      description: `SS Handrail (${typeLabel}, ${locLabel})`,
      descriptionZh: `不鏽鋼扶手 (${typeLabelZh}, ${locLabelZh})`,
      details: `Length: ${len}m`,
      detailsZh: `長度: ${len}米`,
      quantity: handrailForm.qty,
      unitPriceEx: priceEx, 
      totalPriceInc: totalInc
    });
  };

  const addRamp = () => {
    const len = parseFloat(rampForm.len) || 0;
    
    if (len <= 0) {
        setFormErrors({ ...formErrors, len: true });
        return;
    }
    setFormErrors({});

    const width = 1.3;
    const area = len * width;
    const rate = rampForm.type === 'merbau' ? 792 : 921;
    let totalEx = area * rate;
    
    // Minimum charge
    if (totalEx < 1400) totalEx = 1400;

    const totalInc = totalEx * (1 + GST_RATE);

    const typeLabel = rampForm.type === 'merbau' ? 'Merbau' : 'Composite';
    const typeLabelZh = rampForm.type === 'merbau' ? '菠蘿格木' : '複合材料';
    const groundLabel = rampForm.ground === 'concrete' ? 'Concrete' : 'Soil';
    const groundLabelZh = rampForm.ground === 'concrete' ? '混凝土' : '土壤';

    addItem({
      id: Date.now().toString(),
      categoryId: 'ramp',
      description: `Access Ramp - ${typeLabel}`,
      descriptionZh: `無障礙斜坡 - ${typeLabelZh}`,
      details: `Length: ${len}m (${area.toFixed(2)}m²), Ground: ${groundLabel}`,
      detailsZh: `長度: ${len}米 (${area.toFixed(2)}平方米), 地面: ${groundLabelZh}`,
      quantity: 1,
      unitPriceEx: totalEx,
      totalPriceInc: totalInc,
      images: [...rampForm.photos] // Add photos to the item
    });

    // Reset Form
    setRampForm({ type: 'merbau', len: '', ground: 'concrete', photos: [] });
  };

  const addRampRail = () => {
    const len = parseFloat(rampRailForm.len) || 0;
    
    if (len <= 0) {
        setFormErrors({ ...formErrors, len: true });
        return;
    }

    // Requirement: only apply for length over 5000mm (5m)
    if (len <= 5) {
      alert("Ramp rails are only applicable for lengths greater than 5000mm (5m).");
      return;
    }
    setFormErrors({});

    const rate = 350;
    const multiplier = rampRailForm.sides === 'both' ? 2 : 1;
    const totalEx = len * rate * multiplier;
    const totalInc = totalEx * (1 + GST_RATE);

    const sideLabel = rampRailForm.sides === 'both' ? 'Both sides' : 'One side';
    const sideLabelZh = rampRailForm.sides === 'both' ? '兩側' : '僅一側';

    addItem({
      id: Date.now().toString(),
      categoryId: 'ramp-rails',
      description: 'Aluminium handrail with kerb rail',
      descriptionZh: '帶路緣導軌的鋁製扶手',
      details: `Length: ${len}m, ${sideLabel}`,
      detailsZh: `長度: ${len}米, ${sideLabelZh}`,
      quantity: 1,
      unitPriceEx: totalEx,
      totalPriceInc: totalInc
    });
  };

  const addMajorBath = () => {
    // Validation
    const errors: Record<string, boolean> = {};
    if (!majorBathForm.len || parseFloat(majorBathForm.len) <= 0) errors.len = true;
    if (!majorBathForm.width || parseFloat(majorBathForm.width) <= 0) errors.width = true;
    if (!majorBathForm.height || parseFloat(majorBathForm.height) <= 0) errors.height = true;

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }
    setFormErrors({});

    // 1. Standard Package
    const stdRate = STANDARD_PACKAGE_RATE;
    const stdRateInc = stdRate * (1 + GST_RATE);

    addItem({
      id: Date.now().toString() + 'std',
      categoryId: 'major-bath',
      description: t('stdPackage'),
      descriptionZh: TRANSLATIONS['stdPackage'].zh,
      details: t('stdPackageDesc') + ` [${majorBathForm.len}x${majorBathForm.width}x${majorBathForm.height}mm]`,
      detailsZh: TRANSLATIONS['stdPackageDesc'].zh + ` [${majorBathForm.len}x${majorBathForm.width}x${majorBathForm.height}毫米]`,
      quantity: 1,
      unitPriceEx: stdRate,
      totalPriceInc: stdRateInc
    });

    // 2. PC Items
    const selectedDefs = MAJOR_BATH_ITEMS.filter(i => majorBathForm.selectedItems.includes(i.id));
    
    selectedDefs.forEach(def => {
      addItem({
        id: Date.now().toString() + def.id,
        categoryId: 'major-bath',
        description: `Major Bath - ${def.label}`,
        descriptionZh: `主要浴室 - ${def.labelZh}`,
        quantity: 1,
        unitPriceEx: def.priceEx,
        totalPriceInc: def.priceEx * (1 + GST_RATE)
      });
    });
  };

  const addMaintenance = () => {
    if (!maintForm.desc.trim()) {
        setFormErrors({ ...formErrors, desc: true });
        return;
    }
    setFormErrors({});
    
    let labourCost = 0;
    const duration = parseFloat(maintForm.duration); 
    
    if (duration <= 2) labourCost = duration * LABOUR_RATES.hourly; 
    else labourCost = LABOUR_RATES.oneDay;

    // Min job rate
    if (labourCost < LABOUR_RATES.minJob) labourCost = LABOUR_RATES.minJob;

    // Fees
    const admin = LABOUR_RATES.adminFee;
    const inspect = maintForm.inspection ? LABOUR_RATES.siteInspection : 0;
    const totalEx = labourCost + admin + inspect;
    const totalInc = totalEx * (1 + GST_RATE);

    addItem({
      id: Date.now().toString(),
      categoryId: 'maintenance',
      description: 'Maintenance Labour & Fees',
      descriptionZh: '維修人工及費用',
      details: `${maintForm.desc} (${maintForm.duration} hrs est.)`,
      detailsZh: `${maintForm.desc} (預計 ${maintForm.duration} 小時)`,
      quantity: 1,
      unitPriceEx: totalEx,
      totalPriceInc: totalInc
    });
  };

  // --- Render Sections ---

  const renderActiveForm = () => {
    switch(activeTab) {
      case 'minor-bath':
        return (
          <div className="space-y-4 animate-fadeIn">
            <DarkSelect label={t('selectMod')} value={minorBathForm.type} onChange={e => setMinorBathForm({...minorBathForm, type: e.target.value})}>
              {MINOR_BATH_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label} (${o.priceEx} ex)</option>)}
            </DarkSelect>
            <DarkInput type="number" label={t('qty')} value={minorBathForm.qty} onChange={e => setMinorBathForm({...minorBathForm, qty: parseInt(e.target.value) || 1})} min={1} />
            <CheckboxGroup label={t('wallScanning')} checked={minorBathForm.scanning} onChange={c => setMinorBathForm({...minorBathForm, scanning: c})} />
            <OrangeButton className="w-full mt-4" onClick={addMinorBath}><Plus size={18} /> {t('addItem')}</OrangeButton>
          </div>
        );
      case 'handrail':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex gap-4">
               <label className="text-white flex items-center gap-2"><input type="radio" name="hr-type" checked={handrailForm.type === 'wall'} onChange={() => setHandrailForm({...handrailForm, type: 'wall'})} /> {t('wallMount')}</label>
               <label className="text-white flex items-center gap-2"><input type="radio" name="hr-type" checked={handrailForm.type === 'stair'} onChange={() => setHandrailForm({...handrailForm, type: 'stair'})} /> {t('stair')}</label>
            </div>
            <DarkSelect label="Location" value={handrailForm.location} onChange={e => setHandrailForm({...handrailForm, location: e.target.value})}>
              <option value="indoor">{t('indoor')}</option>
              <option value="outdoor">{t('outdoor')}</option>
            </DarkSelect>
            <DarkInput 
                type="number" 
                label={t('lengthM')} 
                value={handrailForm.len} 
                onChange={e => {
                    setHandrailForm({...handrailForm, len: e.target.value});
                    if (formErrors.len) setFormErrors({...formErrors, len: false});
                }}
                error={formErrors.len}
            />
            <DarkInput type="number" label={t('qty')} value={handrailForm.qty} onChange={e => setHandrailForm({...handrailForm, qty: parseInt(e.target.value) || 1})} min={1} />
            <OrangeButton className="w-full mt-4" onClick={addHandrail}><Plus size={18} /> {t('addItem')}</OrangeButton>
          </div>
        );
      case 'ramp':
        return (
          <div className="space-y-4 animate-fadeIn">
             <DarkSelect label="Type" value={rampForm.type} onChange={e => setRampForm({...rampForm, type: e.target.value})}>
              <option value="merbau">Merbau ($792/sqm)</option>
              <option value="composite">Composite ($921/sqm)</option>
            </DarkSelect>
            <DarkInput 
                type="number" 
                label={t('lengthM')} 
                value={rampForm.len} 
                onChange={e => {
                    setRampForm({...rampForm, len: e.target.value});
                    if (formErrors.len) setFormErrors({...formErrors, len: false});
                }}
                error={formErrors.len}
            />
            <DarkSelect label={t('groundType')} value={rampForm.ground} onChange={e => setRampForm({...rampForm, ground: e.target.value})}>
              <option value="concrete">{t('concrete')}</option>
              <option value="soil">{t('soil')}</option>
            </DarkSelect>
            
            {/* Photo Upload Area */}
            <div 
              className="p-4 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:border-brandOrange hover:text-white hover:bg-white/5 transition-all"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handlePhotoDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handlePhotoSelect} 
              />
              <Camera size={24} />
              <span className="text-sm font-medium">{t('uploadPhotos')}</span>
              <span className="text-xs text-gray-500">Drag & Drop or Click to browse</span>
            </div>
            
            {/* Photo Previews */}
            {rampForm.photos.length > 0 && (
               <div className="grid grid-cols-4 gap-2 mt-2 animate-fadeIn">
                 {rampForm.photos.map((photo, idx) => (
                   <div key={idx} className="relative group aspect-square">
                      <img src={photo} className="w-full h-full object-cover rounded border border-gray-600 shadow-sm" alt="Preview" />
                      <button 
                          onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                          <X size={12} />
                      </button>
                   </div>
                 ))}
               </div>
            )}

            <OrangeButton className="w-full mt-4" onClick={addRamp}><Plus size={18} /> {t('addItem')}</OrangeButton>
          </div>
        );
      case 'ramp-rails':
        return (
           <div className="space-y-4 animate-fadeIn">
            <DarkInput 
                type="number" 
                label={t('lengthM')} 
                value={rampRailForm.len} 
                onChange={e => {
                    setRampRailForm({...rampRailForm, len: e.target.value});
                    if (formErrors.len) setFormErrors({...formErrors, len: false});
                }}
                error={formErrors.len}
            />
            <p className="text-xs text-brandOrange italic -mt-2">Minimum length 5m (5000mm) required</p>
             <div className="flex gap-4">
               <label className="text-white flex items-center gap-2"><input type="radio" checked={rampRailForm.sides === 'one'} onChange={() => setRampRailForm({...rampRailForm, sides: 'one'})} /> {t('oneSide')}</label>
               <label className="text-white flex items-center gap-2"><input type="radio" checked={rampRailForm.sides === 'both'} onChange={() => setRampRailForm({...rampRailForm, sides: 'both'})} /> {t('bothSides')}</label>
            </div>
            <OrangeButton className="w-full mt-4" onClick={addRampRail}><Plus size={18} /> {t('addItem')}</OrangeButton>
           </div>
        );
      case 'major-bath':
        const toggleItem = (id: string) => {
          setMajorBathForm(prev => ({
            ...prev,
            selectedItems: prev.selectedItems.includes(id) 
              ? prev.selectedItems.filter(i => i !== id)
              : [...prev.selectedItems, id]
          }));
        };
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-3 gap-2">
              <DarkInput 
                type="number" 
                label={t('lengthMm')} 
                value={majorBathForm.len} 
                onChange={e => {
                    setMajorBathForm({...majorBathForm, len: e.target.value});
                    if (formErrors.len) setFormErrors(prev => ({...prev, len: false}));
                }} 
                error={formErrors.len}
              />
              <DarkInput 
                type="number" 
                label={t('widthMm')} 
                value={majorBathForm.width} 
                onChange={e => {
                    setMajorBathForm({...majorBathForm, width: e.target.value});
                    if (formErrors.width) setFormErrors(prev => ({...prev, width: false}));
                }} 
                error={formErrors.width}
              />
              <DarkInput 
                type="number" 
                label={t('ceilingHtMm')} 
                value={majorBathForm.height} 
                onChange={e => {
                    setMajorBathForm({...majorBathForm, height: e.target.value});
                    if (formErrors.height) setFormErrors(prev => ({...prev, height: false}));
                }}
                error={formErrors.height}
              />
            </div>
            <div className="bg-navyLight p-3 rounded">
              <label className="text-xs text-gray-400 font-medium mb-2 block">{t('inclusions')}</label>
              <div className="grid grid-cols-2 gap-2">
                {MAJOR_BATH_ITEMS.map(item => (
                  <CheckboxGroup 
                    key={item.id} 
                    label={lang === 'zh' ? item.labelZh : item.label} 
                    checked={majorBathForm.selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-navyLight p-3 rounded border border-gray-600">
               <div className="text-brandOrange font-bold mb-1">{t('stdPackage')}</div>
               <div className="text-xs text-gray-300">{t('stdPackageDesc')}</div>
               <div className="text-lg font-bold mt-2 text-white">{formatCurrency(STANDARD_PACKAGE_RATE)} <span className="text-xs font-normal text-gray-400">+ GST</span></div>
            </div>
            <OrangeButton className="w-full mt-4" onClick={addMajorBath}><Plus size={18} /> {t('addItem')}</OrangeButton>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col gap-1 w-full">
              <DarkTextarea
                label={t('jobDesc')}
                value={maintForm.desc}
                onChange={e => {
                    setMaintForm({...maintForm, desc: e.target.value});
                    if (formErrors.desc) setFormErrors({...formErrors, desc: false});
                }}
                error={formErrors.desc}
              />
            </div>
            <DarkSelect label={t('estDuration')} value={maintForm.duration} onChange={e => setMaintForm({...maintForm, duration: e.target.value})}>
              <option value="0.5">0.5 Hours</option>
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="4">0.5 Days (4 hrs)</option>
              <option value="8">1 Day (8 hrs)</option>
              <option value="16">2 Days</option>
            </DarkSelect>
            <CheckboxGroup label={t('siteInspection')} checked={maintForm.inspection} onChange={c => setMaintForm({...maintForm, inspection: c})} />
            <OrangeButton className="w-full mt-4" onClick={addMaintenance}><Plus size={18} /> {t('addItem')}</OrangeButton>
          </div>
        );
      default: return null;
    }
  };

  // --- Calculations for Summary ---
  
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceEx * item.quantity, 0); 
  
  const gstTotal = subtotal * GST_RATE;
  const grandTotal = subtotal + gstTotal;

  // Group items by category for the receipt
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, LineItem[]>);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 relative">
      {/* Header */}
      <header className="bg-navy text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold flex items-center gap-3">
              <FBCLogo />
              <span className="flex flex-col leading-tight">
                <span className="text-xl tracking-tight text-white">FBC <span className="text-brandOrange">Estimator</span></span>
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex rounded-full bg-navyLight border border-gray-600 p-1">
              <button onClick={() => setLang('en')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-brandOrange text-white' : 'text-gray-300 hover:text-white'}`}>English</button>
              <button onClick={() => setLang('zh')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${lang === 'zh' ? 'bg-brandOrange text-white' : 'text-gray-300 hover:text-white'}`}>中文</button>
            </div>
            <div className="text-xs text-gray-400 font-mono hidden md:block">{REF_NUMBER}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-0">
        
        {/* Left Column: Controls (45%) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Client Details */}
          <div className="bg-white rounded shadow p-4 border-l-4 border-navy">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-navy">{t('clientDetails')}</h2>
            </div>
            <div className="space-y-3">
              <DarkInput 
                label={t('clientName')} 
                value={client.name} 
                onChange={e => {
                    setClient({...client, name: e.target.value});
                    if (clientErrors.name) setClientErrors(prev => ({...prev, name: false}));
                }} 
                placeholder="Manager Name & Company" 
                error={clientErrors.name}
              />
              <DarkInput label={t('address')} value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Job Address & Client Name" />
              <div className="flex flex-col sm:flex-row gap-2">
                <DarkInput label={t('phone')} value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} placeholder="0400 000 000" />
                <DarkInput 
                    label={t('email')} 
                    value={client.email} 
                    onChange={e => {
                        setClient({...client, email: e.target.value});
                        if (clientErrors.email) setClientErrors(prev => ({...prev, email: false}));
                    }} 
                    placeholder="email@example.com" 
                    error={clientErrors.email}
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded shadow overflow-hidden flex flex-col border-l-4 border-brandOrange">
            {/* Tabs */}
            <div className="flex overflow-x-auto bg-navyLight no-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-4 ${activeTab === cat.id ? 'border-brandOrange text-brandOrange bg-navy' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  {lang === 'zh' ? cat.labelZh : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Active Form */}
            <div className="p-6 bg-navy text-white flex-grow">
              <div className="mb-4 pb-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-brandOrange mb-1">
                  {CATEGORIES.find(c => c.id === activeTab)?.[lang === 'zh' ? 'labelZh' : 'labelEn']}
                </h3>
                <p className="text-xs text-gray-400">{t('configSpecs')}</p>
              </div>
              {renderActiveForm()}
            </div>
          </div>
        </div>

        {/* Right Column: Summary (55%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Total Estimation Summary (Moved here - Top of Right Column) */}
          <div className="flex justify-between items-center bg-white p-4 rounded shadow">
             <h2 className="font-bold text-navy">{t('totalSummary')}</h2>
             <div className="flex flex-col items-end gap-1">
               <div className="flex gap-2">
                  <button onClick={handleExportPDF} className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-navy px-3 py-2 rounded font-medium transition-colors">
                    <Download size={14} /> {t('exportPdf')}
                  </button>
                  <button 
                    onClick={handleShareClick} 
                    className="text-xs flex items-center gap-1 px-3 py-2 rounded font-medium transition-colors bg-green-100 hover:bg-green-200 text-green-800"
                  >
                    <Send size={14} /> {t('submitQuote')}
                  </button>
               </div>
             </div>
          </div>
          
          {/* The Actual Quote Paper */}
          <div id="quote-summary" className="bg-white p-8 rounded shadow-lg min-h-[600px] text-sm relative">
            
            {/* PDF Header */}
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-wide">{t('companyName')}</h1>
                <p className="text-gray-500 font-bold tracking-widest text-xs mb-4">{t('construction')}</p>
                <div className="text-gray-600 text-xs space-y-1">
                   <p><span className="font-bold">{t('contact')}:</span> Dickson Lam</p>
                   <p>Sydney, NSW</p>
                   <p>freedombuildingconstruction@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800 mb-2">{t('estimate')}</div>
                <div className="text-gray-600 text-xs space-y-1">
                  <p><span className="font-bold">Ref:</span> {REF_NUMBER}</p>
                  <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                  <p><span className="font-bold">Lic No:</span> 270939C</p>
                  <p><span className="font-bold">ABN:</span> 33 160 818 502</p>
                </div>
              </div>
            </div>

            {/* Client Info on Quote */}
            {(client.name || client.address) && (
              <div className="mb-6 bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-navy mb-2 text-xs uppercase tracking-wider">Prepared For</h3>
                <p className="font-bold">{client.name}</p>
                <p className="text-gray-600">{client.address}</p>
                <p className="text-gray-600">{client.phone}</p>
                <p className="text-gray-600">{client.email}</p>
              </div>
            )}

            {/* Line Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-navy text-navy text-xs uppercase text-left">
                  <th className="py-2 pl-2 w-[50%]">{t('description')}</th>
                  <th className="py-2 text-center w-[10%]">{t('qty')}</th>
                  <th className="py-2 text-right w-[20%]">{t('unitEx')}</th>
                  <th className="py-2 text-right w-[20%]">{t('totalInc')}</th>
                  <th className="w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(cat => {
                  const catItems = groupedItems[cat.id];
                  if (!catItems || catItems.length === 0) return null;
                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="bg-gray-100">
                         <td colSpan={5} className="py-2 pl-2 font-bold text-navy text-xs uppercase mt-4">{lang === 'zh' ? cat.labelZh : cat.labelEn}</td>
                      </tr>
                      {catItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                          <td className="py-3 pl-2">
                            <div className="font-medium text-gray-800">{lang === 'zh' && item.descriptionZh ? item.descriptionZh : item.description}</div>
                            {item.details && <div className="text-xs text-gray-500 mt-1">{lang === 'zh' && item.detailsZh ? item.detailsZh : item.details}</div>}
                            {/* Render attached photos for the item */}
                            {item.images && item.images.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {item.images.map((img, i) => (
                                        <img key={i} src={img} className="h-16 w-16 object-cover rounded border border-gray-200" alt="Item attachment" />
                                    ))}
                                </div>
                            )}
                          </td>
                          <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600 text-xs">{formatCurrency(item.unitPriceEx)}</td>
                          <td className="py-3 text-right font-medium text-gray-800 text-xs">{formatCurrency(item.totalPriceInc)}</td>
                          <td className="py-3 text-center">
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded mb-8">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                <p>No items added yet.</p>
                <p className="text-xs">Use the panel on the left to configure services.</p>
              </div>
            )}

            {/* Totals */}
            <div className="flex flex-col items-end space-y-2 border-t pt-4">
              <div className="flex w-full md:w-1/2 justify-between text-sm">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex w-full md:w-1/2 justify-between text-sm">
                <span className="text-gray-600">{t('gst')}</span>
                <span className="font-medium">{formatCurrency(gstTotal)}</span>
              </div>
              <div className="flex w-full md:w-1/2 justify-between text-xl font-bold text-navy mt-2 pt-2 border-t border-gray-200">
                <span>{t('grandTotal')}</span>
                <span className="text-brandOrange">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
              <p>This is an estimate. Final quote may vary after site inspection. All work guaranteed to meet Australian Building Standards.</p>
              <p className="mt-1">Freedom Building Construction | ABN: 33 160 818 502 | Lic: 270939C</p>
            </div>
          </div>
        </div>
      </main>

      {/* SEND OPTIONS MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-navy p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                 <Send size={18} /> Send Quote
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose how you would like to send the quote request to <span className="font-bold text-navy">Freedom Building</span>.
              </p>
              
              {/* Option: Gmail Web */}
              <button onClick={handleOpenGmail} className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brandOrange hover:bg-orange-50 transition-all group">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-100 text-red-600 p-2 rounded-full group-hover:bg-brandOrange group-hover:text-white transition-colors">
                     <Mail size={20} />
                   </div>
                   <div className="text-left">
                     <div className="font-bold text-navy">Gmail</div>
                     <div className="text-xs text-gray-500">Open in Gmail Web</div>
                   </div>
                 </div>
                 <div className="text-gray-400 group-hover:text-brandOrange">→</div>
              </button>

              {/* Option 2: Native Share (Mobile) */}
              {navigator.share && (
                <button onClick={handleNativeShare} className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brandOrange hover:bg-orange-50 transition-all group">
                   <div className="flex items-center gap-3">
                     <div className="bg-purple-100 text-purple-600 p-2 rounded-full group-hover:bg-brandOrange group-hover:text-white transition-colors">
                       <Share2 size={20} />
                     </div>
                     <div className="text-left">
                       <div className="font-bold text-navy">Share...</div>
                       <div className="text-xs text-gray-500">WhatsApp, Messages, etc.</div>
                     </div>
                   </div>
                   <div className="text-gray-400 group-hover:text-brandOrange">→</div>
                </button>
              )}

              {/* Option 3: Copy to Clipboard */}
              <button onClick={handleCopyToClipboard} className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brandOrange hover:bg-orange-50 transition-all group">
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full transition-colors ${copyStatus ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 group-hover:bg-brandOrange group-hover:text-white'}`}>
                     {copyStatus ? <CheckCircle size={20} /> : <Copy size={20} />}
                   </div>
                   <div className="text-left">
                     <div className="font-bold text-navy">{copyStatus ? 'Copied!' : 'Copy Text'}</div>
                     <div className="text-xs text-gray-500">Paste manually into email</div>
                   </div>
                 </div>
                 {!copyStatus && <div className="text-gray-400 group-hover:text-brandOrange">→</div>}
              </button>
            </div>
            
            <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t">
               Don't forget to attach site photos to your message!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;