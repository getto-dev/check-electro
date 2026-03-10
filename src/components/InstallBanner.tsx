'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Share } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { cn } from '@/lib/utils';

const DISMISSED_KEY = 'pwa-install-dismissed';
const SHOW_DELAY = 3000; // Показывать через 3 секунды

export function InstallBanner() {
  const { canInstall, isInstalled, install } = usePWA();
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Проверяем, отклонял ли пользователь ранее
  useEffect(() => {
    if (!canInstall || isInstalled) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Показывать снова через 7 дней после отклонения
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Показываем с задержкой
    const timer = setTimeout(() => setShow(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleInstall = useCallback(async () => {
    setIsInstalling(true);
    const accepted = await install();
    if (!accepted) {
      setIsInstalling(false);
    }
  }, [install]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  if (!show || isInstalled) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 safe-bottom',
        'animate-in slide-in-from-bottom duration-300'
      )}
    >
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-xl p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">
              Установить приложение
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Работает офлайн, быстрый доступ с главного экрана
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors"
          >
            Не сейчас
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white',
              'gradient-bg hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]',
              'transition-all disabled:opacity-70 disabled:cursor-not-allowed'
            )}
          >
            {isInstalling ? 'Установка...' : 'Установить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Баннер для iOS (инструкция по установке)
export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Проверяем iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isIOS || isStandalone) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY + '-ios');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const timer = setTimeout(() => setShow(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY + '-ios', Date.now().toString());
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 safe-bottom animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <Share className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">
              Добавить на экран
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Нажмите <Share className="w-4 h-4 inline mx-0.5" /> и выберите «На экран Домой»
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
