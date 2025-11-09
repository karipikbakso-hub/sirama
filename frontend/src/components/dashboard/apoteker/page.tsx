'use client'

import { useState } from 'react'
import { MdLocalPharmacy, MdAssignment, MdStorage, MdReceiptLong, MdPeople, MdWarning } from 'react-icons/md'

export default function ApotekerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          💊 Dashboard Apoteker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sistem Manajemen Farmasi & Obat - RS Sirama
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdAssignment className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Prescriptions Today</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">45</p>
              <p className="text-xs text-green-600">+8% dari kemarin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdLocalPharmacy className="text-2xl text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Medications Dispensed</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">127</p>
              <p className="text-xs text-green-600">+12% dari kemarin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdStorage className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">7</p>
              <p className="text-xs text-red-600">Perlu restock</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdWarning className="text-2xl text-red-600 dark:text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drug Interactions</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">3</p>
              <p className="text-xs text-orange-600">Perlu review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdAssignment className="inline mr-2" />
                Validate Prescription
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdLocalPharmacy className="inline mr-2" />
                Dispense Medication
              </button>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdStorage className="inline mr-2" />
                Check Inventory
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdReceiptLong className="inline mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Pending Prescriptions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Pending Prescriptions
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      RX-{String(i).padStart(3, '0')} - Dr. {['Surya', 'Aminah', 'Santoso', 'Sari', 'Hartono'][i-1]}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {['Paracetamol 500mg', 'Amoxicillin 500mg', 'Ibuprofen 400mg', 'Omeprazole 20mg', 'Metformin 500mg'][i-1]} - {['Adult', 'Child', 'Adult', 'Adult', 'Adult'][i-1]}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ['bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800'][i % 3]
                    }`}>
                      {['Pending', 'Validated', 'Ready'][i % 3]}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800" title="Process Prescription">
                      <MdAssignment className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacy Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Paracetamol 500mg', stock: 15, min: 20 },
              { name: 'Amoxicillin 500mg', stock: 8, min: 15 },
              { name: 'Ibuprofen 400mg', stock: 12, min: 25 },
              { name: 'Insulin Regular', stock: 5, min: 10 }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Stock: {item.stock} (Min: {item.min})
                  </p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Recent Pharmacy Activities
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium text-gray-800 dark:text-white">Prescription Validated</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">RX-045 - Paracetamol 500mg - 5 minutes ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium text-gray-800 dark:text-white">Medication Dispensed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amoxicillin 500mg x 21 tablets - 12 minutes ago</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="font-medium text-gray-800 dark:text-white">Stock Updated</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ibuprofen 400mg +50 units - 18 minutes ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-medium text-gray-800 dark:text-white">Drug Interaction Alert</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warfarin + Aspirin combination - 25 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
