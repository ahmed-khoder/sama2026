'use client';

import React from 'react';
import DashboardTabs from './components/DashboardTabs';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-marine-900 dark:text-white mb-2">لوحة المعلومات</h1>
          <p className="text-gray-500 dark:text-gray-400">نظرة عامة على أداء الشركة اليوم</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium outline-none">
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
            <option>هذا العام</option>
          </select>
          <button className="bg-brand-orange hover:bg-brand-darkOrange text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-brand-orange/20">
            تحميل تقرير
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <DashboardTabs />
    </div>
  );
}
