import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CookiesProvider } from 'react-cookie';
import { ToastProvider } from "./Component/ui/PopUp/ToastContext";
import { ConfirmProvider } from "./Component/ui/PopUp/ConfirmContext";
import { AuthProvider } from "./context/AuthContext";
import './index.css';
import App from './App.jsx';

// 1️⃣ استيراد الأدوات الخاصة بإدارة الكاش من React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2️⃣ إنشاء نسخة الـ Client مع الإعدادات الذكية لمنع التكرار المزعج
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // يمنع إعادة جلب البيانات لمجرد أنك ضغطت داخل نافذة المتصفح
      staleTime: 1000 * 60 * 5,    // يعتبر البيانات "طازجة" لمدة 5 دقائق كاملة، فلا يعيد تحميلها عند التنقل
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              {/* 3️⃣ تغليف التطبيق بالـ Provider لتشغيل الكاش في كل الصفحات */}
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </CookiesProvider>
    </BrowserRouter>
  </StrictMode>
);
