'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X } from 'lucide-react';
import { CATALOG, CATEGORIES, VERSION, formatCurrency, getCategoryName, getCategoryIcon } from '@/lib/catalog';
import type { Service } from '@/lib/catalog';
import { cn } from '@/lib/utils';

// Utility for declension of Russian words
function declOfNum(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

// Highlight search matches
const highlight = (text: string, query: string) => {
  if (!query || query.length < 2) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="bg-primary/20 px-0.5 rounded font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Service Item Component
const ServiceItem = memo(function ServiceItem({
  service,
  searchQuery,
  showCategory,
}: {
  service: Service & { catId?: string; catName?: string };
  searchQuery: string;
  showCategory: boolean;
}) {
  return (
    <article
      className={cn(
        'flex items-center gap-3 p-3 sm:p-4 rounded-xl',
        'bg-card border border-border',
        'hover:border-primary hover:translate-x-1 hover:shadow-lg',
        'transition-all touch-manipulation'
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base mb-0.5">
          {highlight(service.n, searchQuery)}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {highlight(service.d, searchQuery)}
          {showCategory && service.catName && (
            <span className="ml-1 opacity-60">• {service.catName}</span>
          )}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-extrabold text-sm sm:text-base gradient-text tabular-nums">
          {formatCurrency(service.p)}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold">
          за {service.u}
        </div>
      </div>
    </article>
  );
});

// Category Button Component
const CategoryButton = memo(function CategoryButton({
  name,
  icon,
  isActive,
  onClick,
}: {
  name: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all touch-manipulation',
        isActive
          ? 'gradient-bg border-transparent text-white'
          : 'bg-card border-border hover:border-primary hover:-translate-y-0.5'
      )}
      aria-pressed={isActive}
    >
      <span className="text-2xl sm:text-3xl" aria-hidden="true">
        {icon}
      </span>
      <span className={cn(
        "text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2",
        isActive && "text-white"
      )}>
        {name}
      </span>
    </button>
  );
});

// Empty State Component
const EmptyState = memo(function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 sm:py-16 text-muted-foreground">
      <div className="text-base font-bold text-foreground mb-2">{message}</div>
      <div className="text-sm">Выберите категорию или введите запрос для поиска</div>
    </div>
  );
});

// Search Info Component
const SearchInfo = memo(function SearchInfo({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-primary/5">
      <span className="text-sm">
        Найдено: <strong className="text-primary">{count}</strong>{' '}
        {declOfNum(count, ['услуга', 'услуги', 'услуг'])}
      </span>
    </div>
  );
});

export default function PricePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClear, setShowClear] = useState(false);

  const handleCategorySelect = useCallback((id: string | null) => {
    setSelectedCategory(id);
    if (id) setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowClear(value.length > 0);
    if (value.length >= 2) setSelectedCategory(null);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setShowClear(false);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return null;

    const query = searchQuery.toLowerCase();
    const results: (Service & { catId: string; catName: string })[] = [];

    Object.entries(CATALOG).forEach(([catId, items]) => {
      items.forEach((item) => {
        const matchName = item.n.toLowerCase().includes(query);
        const matchDesc = item.d.toLowerCase().includes(query);
        if (matchName || matchDesc) {
          results.push({
            ...item,
            catId,
            catName: getCategoryName(catId),
          });
        }
      });
    });

    return results.slice(0, 50);
  }, [searchQuery]);

  // Category services
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return null;
    return CATALOG[selectedCategory] || [];
  }, [selectedCategory]);

  // Selected category info
  const selectedCategoryInfo = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES.find((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 safe-bottom">
        {/* Header */}
        <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/50">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border hover:border-primary transition-all"
            aria-label="Вернуться к калькулятору"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-lg sm:text-xl font-extrabold gradient-text whitespace-nowrap">
            Прайс-лист
          </span>
          <div className="flex-1 min-w-[120px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск услуг..."
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium',
                'bg-card border-2 border-border',
                'focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/25',
                'transition-all touch-manipulation'
              )}
              aria-label="Поиск услуг"
            />
            {showClear && (
              <button
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-muted-foreground text-white hover:bg-accent active:scale-90 transition-all touch-manipulation"
                aria-label="Очистить поиск"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Categories */}
        <section className="mb-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 px-1">
            Категории услуг
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2" role="listbox">
            {CATEGORIES.map((cat) => (
              <CategoryButton
                key={cat.id}
                name={cat.name}
                icon={cat.icon}
                isActive={selectedCategory === cat.id}
                onClick={() => handleCategorySelect(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Services */}
        {searchResults !== null ? (
          searchResults.length === 0 ? (
            <EmptyState message="Ничего не найдено" />
          ) : (
            <section>
              <SearchInfo count={searchResults.length} />
              <div className="flex flex-col gap-2">
                {searchResults.map((service) => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    searchQuery={searchQuery}
                    showCategory={true}
                  />
                ))}
              </div>
            </section>
          )
        ) : !selectedCategory ? (
          <div className="text-center py-12 sm:py-16 text-muted-foreground">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-base font-bold text-foreground mb-2">Выберите категорию</div>
            <div className="text-sm">Или воспользуйтесь поиском для быстрого поиска услуг</div>
          </div>
        ) : (
          <section>
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                <span>{selectedCategoryInfo?.icon}</span>
                {selectedCategoryInfo?.name}
              </h2>
              <span className="text-xs bg-muted px-3 py-1.5 rounded-full font-semibold">
                {categoryServices?.length || 0}{' '}
                {declOfNum(categoryServices?.length || 0, ['услуга', 'услуги', 'услуг'])}
              </span>
            </header>
            <div className="flex flex-col gap-2">
              {categoryServices?.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  searchQuery=""
                  showCategory={false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[10px] sm:text-[11px] text-muted-foreground/60 border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold">Getto-Dev</span>
          <span>•</span>
          <span>v{VERSION}</span>
        </div>
      </footer>
    </div>
  );
}
