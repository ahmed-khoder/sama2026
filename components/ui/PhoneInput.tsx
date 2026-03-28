'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Country data with flags and dial codes
const countries = [
    { code: 'EG', name: 'Egypt', nameAr: 'مصر', dialCode: '+20', flag: '🇪🇬' },
    { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', dialCode: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', nameAr: 'الإمارات', dialCode: '+971', flag: '🇦🇪' },
    { code: 'KW', name: 'Kuwait', nameAr: 'الكويت', dialCode: '+965', flag: '🇰🇼' },
    { code: 'QA', name: 'Qatar', nameAr: 'قطر', dialCode: '+974', flag: '🇶🇦' },
    { code: 'BH', name: 'Bahrain', nameAr: 'البحرين', dialCode: '+973', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman', nameAr: 'عُمان', dialCode: '+968', flag: '🇴🇲' },
    { code: 'JO', name: 'Jordan', nameAr: 'الأردن', dialCode: '+962', flag: '🇯🇴' },
    { code: 'LB', name: 'Lebanon', nameAr: 'لبنان', dialCode: '+961', flag: '🇱🇧' },
    { code: 'IQ', name: 'Iraq', nameAr: 'العراق', dialCode: '+964', flag: '🇮🇶' },
    { code: 'SY', name: 'Syria', nameAr: 'سوريا', dialCode: '+963', flag: '🇸🇾' },
    { code: 'PS', name: 'Palestine', nameAr: 'فلسطين', dialCode: '+970', flag: '🇵🇸' },
    { code: 'YE', name: 'Yemen', nameAr: 'اليمن', dialCode: '+967', flag: '🇾🇪' },
    { code: 'LY', name: 'Libya', nameAr: 'ليبيا', dialCode: '+218', flag: '🇱🇾' },
    { code: 'TN', name: 'Tunisia', nameAr: 'تونس', dialCode: '+216', flag: '🇹🇳' },
    { code: 'DZ', name: 'Algeria', nameAr: 'الجزائر', dialCode: '+213', flag: '🇩🇿' },
    { code: 'MA', name: 'Morocco', nameAr: 'المغرب', dialCode: '+212', flag: '🇲🇦' },
    { code: 'SD', name: 'Sudan', nameAr: 'السودان', dialCode: '+249', flag: '🇸🇩' },
    { code: 'TR', name: 'Turkey', nameAr: 'تركيا', dialCode: '+90', flag: '🇹🇷' },
    { code: 'US', name: 'United States', nameAr: 'أمريكا', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', nameAr: 'بريطانيا', dialCode: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', nameAr: 'ألمانيا', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', nameAr: 'فرنسا', dialCode: '+33', flag: '🇫🇷' },
    { code: 'CN', name: 'China', nameAr: 'الصين', dialCode: '+86', flag: '🇨🇳' },
    { code: 'IN', name: 'India', nameAr: 'الهند', dialCode: '+91', flag: '🇮🇳' },
];

export type Country = typeof countries[0];

interface PhoneInputProps {
    value: string;
    onChange: (value: string, countryCode: string, dialCode: string) => void;
    language?: 'ar' | 'en';
    placeholder?: string;
    className?: string;
    error?: string;
}

export default function PhoneInput({
    value,
    onChange,
    language = 'ar',
    placeholder,
    className,
    error,
}: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to Egypt
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-detect country based on IP (on mount)
    useEffect(() => {
        const detectCountry = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const detected = countries.find(c => c.code === data.country_code);
                if (detected) {
                    setSelectedCountry(detected);
                    onChange(value, detected.code, detected.dialCode);
                }
            } catch {
                // Default to Egypt if detection fails
                setSelectedCountry(countries[0]);
            }
        };
        detectCountry();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(country => {
        const query = searchQuery.toLowerCase();
        return (
            country.name.toLowerCase().includes(query) ||
            country.nameAr.includes(query) ||
            country.dialCode.includes(query)
        );
    });

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchQuery('');
        onChange(value, country.code, country.dialCode);
        inputRef.current?.focus();
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/[^\d]/g, '');
        onChange(newValue, selectedCountry.code, selectedCountry.dialCode);
    };

    const defaultPlaceholder = language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number';

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className={cn(
                "flex items-center rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all duration-200",
                error
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-200"
                    : "border-gray-200 dark:border-slate-700 focus-within:border-marine-500 focus-within:ring-2 focus-within:ring-marine-200 dark:focus-within:ring-marine-800"
            )}>
                {/* Country Selector */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-3 border-r dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg rtl:border-r-0 rtl:border-l"
                >
                    <span className="text-2xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                        {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </button>

                {/* Phone Input */}
                <input
                    ref={inputRef}
                    type="tel"
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder || defaultPlaceholder}
                    dir="ltr"
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={language === 'ar' ? 'ابحث عن دولة...' : 'Search country...'}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-marine-500 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Countries List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => handleCountrySelect(country)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors",
                                            selectedCountry.code === country.code && "bg-marine-50 dark:bg-marine-900/30"
                                        )}
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <span className="flex-1 text-left rtl:text-right text-gray-900 dark:text-white">
                                            {language === 'ar' ? country.nameAr : country.name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {country.dialCode}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                    {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

export { countries };
