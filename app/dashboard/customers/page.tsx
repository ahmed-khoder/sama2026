'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Filter, Mail, Phone, MapPin,
    ExternalLink, Building2, Globe2
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string | false;
    phone: string | false;
    city: string | false;
    country_id: [number, string] | false;
    image_128: string | null;
    function: string | false;
    parent_name: string | false;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/odoo/customers?limit=50');
            const data = await res.json();

            if (data.status === 'error') {
                throw new Error(data.message);
            }

            setCustomers(data.customers);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof c.email === 'string' && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-marine-900 dark:text-white mb-2">العملاء</h1>
                    <p className="text-gray-500 dark:text-gray-400">إدارة وعرض قاعدة بيانات العملاء من Odoo</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث عن عميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 h-72 animate-pulse">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mb-4" />
                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mx-auto mb-3" />
                            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mx-auto mb-6" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                                <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-2xl text-center">
                    <p className="font-bold mb-2">حدث خطأ أثناء تحميل البيانات</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchCustomers}
                        className="mt-4 px-6 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCustomers.map((customer, index) => (
                        <motion.div
                            key={customer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-6 text-center relative">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-marine-50 to-marine-100 dark:from-marine-900/20 dark:to-marine-800/10" />

                                <div className="relative mb-4">
                                    <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        {customer.image_128 ? (
                                            <img
                                                src={customer.image_128}
                                                alt={customer.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-marine-100 dark:bg-marine-900/50 flex items-center justify-center text-marine-600 dark:text-marine-400 text-2xl font-bold">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-1 line-clamp-1" title={customer.name}>
                                    {customer.name}
                                </h3>

                                <div className="text-xs font-medium text-brand-orange mb-4 h-5">
                                    {customer.function && customer.parent_name
                                        ? `${customer.function} at ${customer.parent_name}`
                                        : customer.parent_name || customer.function || ''}
                                </div>

                                <div className="space-y-3 text-sm text-left">
                                    {customer.email && (
                                        <div className="flex items-center gap-3 text-gray-500 hover:text-marine-600 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-marine-100 dark:group-hover:bg-marine-900/30 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="truncate" title={customer.email as string}>{customer.email}</span>
                                        </div>
                                    )}

                                    {customer.phone && (
                                        <div className="flex items-center gap-3 text-gray-500 hover:text-marine-600 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-marine-100 dark:group-hover:bg-marine-900/30 transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{customer.phone}</span>
                                        </div>
                                    )}

                                    {(customer.city || customer.country_id) && (
                                        <div className="flex items-center gap-3 text-gray-500 hover:text-marine-600 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-marine-100 dark:group-hover:bg-marine-900/30 transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">
                                                {[
                                                    customer.city,
                                                    Array.isArray(customer.country_id) ? customer.country_id[1] : ''
                                                ].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
