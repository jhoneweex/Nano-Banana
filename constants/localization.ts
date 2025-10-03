import { Language } from '../types';

type LocalizedStrings = {
  [key: string]: {
    [lang in Language]: string;
  };
};

export const strings: LocalizedStrings = {
  // Login Page
  signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
  signInGoogle: { en: 'Sign in with Google', ar: 'تسجيل الدخول بحساب جوجل' },
  emailPlaceholder: { en: 'Email or phone', ar: 'البريد الإلكتروني أو الهاتف' },
  passwordPlaceholder: { en: 'Password', ar: 'كلمة المرور' },
  next: { en: 'Next', ar: 'التالي' },
  emailError: { en: 'Please enter a valid @gmail.com address.', ar: 'الرجاء إدخال عنوان @gmail.com صالح.' },
  passwordError: { en: 'Password cannot be empty.', ar: 'كلمة المرور لا يمكن أن تكون فارغة.' },
  loginDisclaimer: { 
    en: 'This is a simulated login. For a real application, use Google OAuth. Use any @gmail.com address to proceed.', 
    ar: 'هذه محاكاة لعملية تسجيل الدخول. للتطبيق الحقيقي، استخدم Google OAuth. استخدم أي عنوان @gmail.com للمتابعة.' 
  },
  promoTitle: {
    en: '🌿💐 Visit our official website for Alternative Medicine & Paranormal Phenomena 🍄🌴',
    ar: '🌿💐زورونا على الموقع الرسمي للطب البديل والظواهر الخارقة🍄🌴'
  },

  // Generator Page
  title: { en: 'Nano Banana Image Studio', ar: 'استوديو نانو بنانا للصور' },
  promptPlaceholder: { 
    en: 'Ask for anything...', 
    ar: 'اسأل عن أي شيء...' 
  },
  uploadImages: { en: 'Upload Images for Editing/Merging', ar: 'تحميل صور للتعديل/الدمج' },
  uploadBtn: { en: 'Click to upload', ar: 'انقر للتحميل' },
  dragDrop: { en: 'or drag and drop', ar: 'أو اسحب وأفلت' },
  imageTypes: { en: 'PNG, JPG, WEBP', ar: 'PNG, JPG, WEBP' },
  uploadedImages: { en: 'Uploaded Images', ar: 'الصور المحملة' },
  aspectRatio: { en: 'Aspect Ratio (for new generations)', ar: 'نسبة العرض إلى الارتفاع (للإنشاء الجديد)' },
  generate: { en: 'Generate', ar: 'إنشاء' },
  generating: { en: 'Generating...', ar: 'جاري الإنشاء...' },
  result: { en: 'Result', ar: 'النتيجة' },
  regenerate: { en: 'Regenerate', ar: 'إعادة الإنشاء' },
  download: { en: 'Download', ar: 'تحميل' },
  errorTitle: { en: 'An Error Occurred', ar: 'حدث خطأ' },
  errorNoApiKey: { en: 'API_KEY environment variable not set.', ar: 'متغير البيئة API_KEY غير معين.' },
  errorGeneration: { en: 'Failed to generate image. Please try again.', ar: 'فشل إنشاء الصورة. يرجى المحاولة مرة أخرى.' },
  history: { en: 'History', ar: 'السجل' },

  // History Page
  historyTitle: { en: 'Generation History', ar: 'سجل الإنشاء' },
  copyPrompt: { en: 'Copy Prompt', ar: 'نسخ الوصف' },
  promptCopied: { en: 'Copied!', ar: 'تم النسخ!' },
  delete: { en: 'Delete', ar: 'حذف' },
  noHistory: { en: 'No history yet. Go create some amazing images!', ar: 'لا يوجد سجل بعد. اذهب وأنشئ بعض الصور الرائعة!' },
  backToGenerator: { en: 'Back to Generator', ar: 'العودة للمولد' },
  viewImage: { en: 'View Full Image', ar: 'عرض الصورة كاملة' },
};