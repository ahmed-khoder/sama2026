'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ship, Plane, Truck, Package, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ShipmentWithClient } from '@/types';

interface ShipmentsClientProps {
  shipments: ShipmentWithClient[];
}

export default function ShipmentsClient({ shipments }: ShipmentsClientProps) {
  const { t, language } = useLanguage();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SEA': return <Ship className="w-5 h-5 text-blue-600" />;
      case 'AIR': return <Plane className="w-5 h-5 text-sky-500" />;
      case 'LAND': return <Truck className="w-5 h-5 text-brand-orange" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CUSTOMS_CLEARANCE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-marine-900 dark:text-white mb-2">{t('shipments_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('shipments_subtitle')}</p>
        </div>
        <button className="px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white rounded-xl shadow-lg shadow-marine-500/20 transition-all font-bold flex items-center gap-2">
          <Package className="w-5 h-5" />
          {language === 'ar' ? 'إضافة شحنة جديدة' : 'New Shipment'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('tracking_no')}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('type')}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('origin')} / {t('destination')}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('status')}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('date')}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-500 dark:text-gray-400">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-marine-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-marine-600 dark:text-marine-400" />
                      </div>
                      <div>
                        <p className="font-bold text-marine-900 dark:text-white">{shipment.trackingNumber}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{shipment.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(shipment.type)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(shipment.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{shipment.origin}</span>
                      <span className="text-xs text-gray-400">↓</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{shipment.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(shipment.status)}`}>
                      {t(shipment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {format(new Date(shipment.createdAt), 'dd MMM yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-marine-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shipments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد شحنات</h3>
            <p className="text-gray-500">لم يتم العثور على أي شحنات في النظام.</p>
          </div>
        )}
      </div>
    </div>
  );
}

