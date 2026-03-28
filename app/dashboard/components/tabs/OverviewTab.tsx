'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Package, TrendingUp, Users, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../shared/StatCard';

// Sample data for charts
const data = [
    { name: 'يناير', shipments: 4000, sales: 2400 },
    { name: 'فبراير', shipments: 3000, sales: 1398 },
    { name: 'مارس', shipments: 2000, sales: 9800 },
    { name: 'أبريل', shipments: 2780, sales: 3908 },
    { name: 'مايو', shipments: 1890, sales: 4800 },
    { name: 'يونيو', shipments: 2390, sales: 3800 },
    { name: 'يوليو', shipments: 3490, sales: 4300 },
];

export default function OverviewTab() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="إجمالي الشحنات"
                    value="1,234"
                    trend="+12.5%"
                    trendUp={true}
                    icon={<Package className="w-6 h-6" />}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-500"
                />
                <StatCard
                    title="عروض الأسعار"
                    value="456"
                    trend="+5.2%"
                    trendUp={true}
                    icon={<FileCheck className="w-6 h-6" />}
                    bg="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-brand-orange"
                />
                <StatCard
                    title="العملاء الجدد"
                    value="89"
                    trend="-2.4%"
                    trendUp={false}
                    icon={<Users className="w-6 h-6" />}
                    bg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-500"
                />
                <StatCard
                    title="الأرباح (شهري)"
                    value="$45,231"
                    trend="+8.1%"
                    trendUp={true}
                    icon={<TrendingUp className="w-6 h-6" />}
                    bg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6">
                        تحليل الشحنات والمبيعات
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="shipments"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorShipments)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6">أحدث الطلبات</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-marine-100 dark:bg-marine-900/30 rounded-lg flex items-center justify-center text-marine-600">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-marine-900 dark:text-white">شحنة #829{i}</h4>
                                    <p className="text-xs text-gray-500">من الرياض إلى دبي</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    مكتملة
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
