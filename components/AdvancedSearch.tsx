'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Calendar, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  labelEn?: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  labelEn?: string;
  type: 'select' | 'multiselect' | 'daterange' | 'checkbox';
  options?: FilterOption[];
}

interface AdvancedSearchProps {
  placeholder?: string;
  placeholderEn?: string;
  filters?: FilterConfig[];
  onSearch: (query: string, filters: Record<string, any>) => void;
  debounceMs?: number;
  showFilterCount?: boolean;
  className?: string;
}

/**
 * Advanced Search Component with Filters
 * Features:
 * - Real-time search with debouncing
 * - Multiple filter types
 * - Filter chips
 * - Active filter count
 * - Responsive design
 */
export default function AdvancedSearch({
  placeholder = 'ابحث...',
  placeholderEn = 'Search...',
  filters = [],
  onSearch,
  debounceMs = 500,
  showFilterCount = true,
  className,
}: AdvancedSearchProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [tempFilters, setTempFilters] = useState<Record<string, any>>({});

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query, activeFilters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, activeFilters, debounceMs, onSearch]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback(
    (filterId: string, value: any) => {
      setTempFilters((prev) => ({
        ...prev,
        [filterId]: value,
      }));
    },
    []
  );

  /**
   * Apply filters
   */
  const applyFilters = useCallback(() => {
    setActiveFilters(tempFilters);
    setShowFilters(false);
  }, [tempFilters]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setTempFilters({});
  }, []);

  /**
   * Remove single filter
   */
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
    setTempFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  }, []);

  /**
   * Count active filters
   */
  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== undefined && activeFilters[key] !== ''
  ).length;

  /**
   * Get filter label
   */
  const getFilterLabel = (filter: FilterConfig, value: any): string => {
    if (filter.type === 'select' || filter.type === 'multiselect') {
      const option = filter.options?.find((opt) => opt.value === value);
      return isRTL ? option?.label || value : option?.labelEn || option?.label || value;
    }
    return value;
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRTL ? placeholder : placeholderEn}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-marine-500/30 focus:border-marine-500 transition-all"
            aria-label={isRTL ? 'البحث' : 'Search'}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={isRTL ? 'مسح البحث' : 'Clear search'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-bold',
              showFilters
                ? 'bg-marine-600 text-white border-marine-600'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
            )}
            aria-label={isRTL ? 'الفلاتر' : 'Filters'}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">{isRTL ? 'فلاتر' : 'Filters'}</span>
            {showFilterCount && activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {isRTL ? 'الفلاتر النشطة:' : 'Active filters:'}
          </span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.id === key);
            if (!filter) return null;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-marine-100 dark:bg-marine-900/30 text-marine-700 dark:text-marine-300 rounded-lg text-sm font-medium"
              >
                <span>{getFilterLabel(filter, value)}</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="hover:text-marine-900 dark:hover:text-white transition-colors"
                  aria-label={`${isRTL ? 'إزالة' : 'Remove'} ${filter.label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium underline"
          >
            {isRTL ? 'مسح الكل' : 'Clear all'}
          </button>
        </motion.div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? filter.label : filter.labelEn || filter.label}
                    </label>

                    {/* Select */}
                    {filter.type === 'select' && filter.options && (
                      <select
                        value={tempFilters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-marine-500"
                      >
                        <option value="">
                          {isRTL ? 'الكل' : 'All'}
                        </option>
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {isRTL ? option.label : option.labelEn || option.label}
                            {option.count !== undefined && ` (${option.count})`}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Checkbox */}
                    {filter.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempFilters[filter.id] || false}
                          onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                          className="w-5 h-5 text-marine-600 rounded focus:ring-2 focus:ring-marine-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? filter.label : filter.labelEn || filter.label}
                        </span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setTempFilters({});
                    clearFilters();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {isRTL ? 'إعادة تعيين' : 'Reset'}
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-colors"
                >
                  {isRTL ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
