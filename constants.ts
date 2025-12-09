import { CategoryDef, Dictionary, PricingItem } from './types';

export const CATEGORIES: CategoryDef[] = [
  { id: 'minor-bath', labelEn: 'Minor Bath', labelZh: '次級浴室' },
  { id: 'handrail', labelEn: 'SS Handrail', labelZh: '不鏽鋼扶手' },
  { id: 'ramp', labelEn: 'Access Ramp', labelZh: '無障礙斜坡' },
  { id: 'ramp-rails', labelEn: 'Ramp Rails', labelZh: '斜坡欄杆' },
  { id: 'major-bath', labelEn: 'Major Bathroom Modification', labelZh: '主要浴室改建' },
  { id: 'maintenance', labelEn: 'Maintenance', labelZh: '維修保養' },
];

export const STANDARD_PACKAGE_RATE = 25000;

export const TRANSLATIONS: Dictionary = {
  appTitle: { en: 'Freedom Building Estimator', zh: '自由建築估算器' },
  clientDetails: { en: 'Client Details', zh: '客戶詳情' },
  clientName: { en: 'Case Manager & Company', zh: '個案經理及公司' },
  address: { en: 'Job Address & Client Name', zh: '施工地址及客戶姓名' },
  phone: { en: 'Phone', zh: '電話' },
  email: { en: 'Email', zh: '電郵' },
  configSpecs: { en: 'Configure specifications to add to quote.', zh: '配置規格以添加到報價' },
  lengthCm: { en: 'Length (cm)', zh: '長度 (厘米)' }, // Keeping for backwards compat if needed, though unused
  lengthMm: { en: 'Length (mm)', zh: '長度 (毫米)' },
  widthCm: { en: 'Width (cm)', zh: '寬度 (厘米)' },
  widthMm: { en: 'Width (mm)', zh: '寬度 (毫米)' },
  lengthM: { en: 'Length (m)', zh: '長度 (米)' },
  ceilingHt: { en: 'Ceiling Ht (cm)', zh: '天花板高度 (厘米)' },
  ceilingHtMm: { en: 'Ceiling Ht (mm)', zh: '天花板高度 (毫米)' },
  inclusions: { en: 'Select Inclusions', zh: '選擇包含項目' },
  labourEst: { en: 'Labour Estimate', zh: '勞動力估算' },
  uploadPhotos: { en: 'Upload site photos or take instant photo', zh: '上傳現場照片或拍攝即時照片' },
  groundType: { en: 'Ground Type', zh: '地面類型' },
  concrete: { en: 'Concrete', zh: '混凝土' },
  soil: { en: 'Soil', zh: '土壤' },
  jobDesc: { en: 'Job Description', zh: '工作描述' },
  estDuration: { en: 'Estimated Duration', zh: '預計時間' },
  siteInspection: { en: 'Site Inspection Required?', zh: '需要現場檢查?' },
  addItem: { en: 'Add Item', zh: '添加項目' },
  submitQuote: { en: 'Submit for Quotation', zh: '提交報價' },
  totalSummary: { en: 'Total Estimation Summary', zh: '總估算摘要' },
  exportPdf: { en: 'Export PDF', zh: '導出 PDF' },
  companyName: { en: 'FREEDOM BUILDING CONSTRUCTION', zh: '自由建築建設公司' },
  construction: { en: 'CONSTRUCTION', zh: '建設' },
  contact: { en: 'Contact', zh: '聯繫' },
  estimate: { en: 'ESTIMATE', zh: '估算' },
  description: { en: 'Description', zh: '說明' },
  qty: { en: 'Qty', zh: '數量' },
  unitEx: { en: 'Unit (Ex)', zh: '單位(不含稅)' },
  totalInc: { en: 'Total (Inc)', zh: '合計(含稅)' },
  subtotal: { en: 'Subtotal (Ex-GST)', zh: '小計(不含稅)' },
  gst: { en: 'GST (10%)', zh: '消費稅 (10%)' },
  grandTotal: { en: 'Total (Inc GST)', zh: '總計(含稅)' },
  wallScanning: { en: 'Include Wall Scanning Fee', zh: '包括牆壁掃描費' },
  selectMod: { en: 'Select Modification', zh: '選擇修改' },
  indoor: { en: 'Indoor', zh: '室內' },
  outdoor: { en: 'Outdoor', zh: '戶外' },
  wallMount: { en: 'Wall Mount', zh: '壁掛式' },
  stair: { en: 'Stair', zh: '樓梯' },
  oneSide: { en: 'One side only', zh: '僅一側' },
  bothSides: { en: 'Both sides', zh: '兩側' },
  stdPackage: { en: 'Standard Package', zh: '標準套餐' },
  stdPackageDesc: { 
    en: 'Includes demolition, waterproofing, tiling, standard plumbing, electrical & installation cost', 
    zh: '包括拆除、防水、瓷磚、標準管道、電氣及安裝費用' 
  },
};

export const MINOR_BATH_OPTIONS: PricingItem[] = [
  { id: 'wall-scanning-fee', label: 'Wall Scanning Fee', priceEx: 150 },
  { id: 'grab-300', label: 'Grab Rail (300-450mm)', priceEx: 350 },
  { id: 'grab-600', label: 'Grab Rail (600-900mm)', priceEx: 380 },
  { id: 'grab-custom', label: 'Custom Grab Rail (L-Type/T-Type)', priceEx: 700 },
  { id: 'handheld-rail', label: 'Hand-held shower on 900mm SS grab rail', priceEx: 550 },
  { id: 'mixer-convert', label: 'Convert wall taps to Quoss Mixer', priceEx: 900 },
  { id: 'shower-curtain', label: 'Shower curtain & rail system', priceEx: 880 },
  { id: 'drop-rail', label: 'Drop down grab rail next to toilet', priceEx: 750 },
  { id: 'antislip', label: 'Bathroom floor anti slip coating', priceEx: 700 },
  { id: 'bidet-std', label: 'Supply and install Evakare bidet', priceEx: 820 },
  { id: 'bidet-short', label: 'Supply and install short size bidet', priceEx: 1250 },
];

export const MAJOR_BATH_ITEMS = [
  { id: 'shower-unit', label: 'Handheld shower on vertical grab rail', labelZh: '垂直扶手上的手持淋浴器', priceEx: 240 },
  { id: 'wall-mixer', label: 'Wall mixer', labelZh: '牆壁混水閥', priceEx: 96 },
  { id: 'shower-rail-curtain', label: 'Shower rail and weighted curtain', labelZh: '淋浴導軌和加重浴簾', priceEx: 420 },
  { id: 'toilet-std', label: 'Standard toilet suite', labelZh: '標準馬桶套件', priceEx: 384 },
  { id: 'bidet-elec', label: 'Electric bidet', labelZh: '電動坐浴盆', priceEx: 540 },
  { id: 'bidet-power', label: 'Power point for bidet', labelZh: '坐浴盆電源插座', priceEx: 156 },
  { id: 'vanity', label: 'Vanity', labelZh: '盥洗台', priceEx: 420 },
  { id: 'shaving-cab', label: 'Mirror/ shaving cabinet', labelZh: '鏡子/剃須櫃', priceEx: 180 },
  { id: 'basin-mixer', label: 'Basin/ vanity mixer YO162', labelZh: '盆地/盥洗台混水閥', priceEx: 96 },
  { id: 'towel-acc', label: 'Double towel rail/ ring/ holder', labelZh: '雙毛巾架/毛巾環/捲紙架', priceEx: 180 },
  { id: 'floor-prot', label: 'Floor protection film and labour', labelZh: '地板保護膜及人工', priceEx: 600 },
];

export const LABOUR_RATES = {
  halfDay: 700,
  oneDay: 1400,
  oneHalfDay: 2100,
  twoDays: 2800,
  fiveDays: 7000,
  hourly: 175,
  minJob: 350,
  adminFee: 90,
  siteInspection: 150,
  wallScanning: 150,
};