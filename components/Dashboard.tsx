import React from 'react';
import { Product, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ products, transactions }) => {
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minLevel).length;
  
  // Calculate recent movements
  const recentIn = transactions.filter(t => t.type === 'IN').slice(0, 50).reduce((acc, t) => acc + t.quantity, 0);
  const recentOut = transactions.filter(t => t.type === 'OUT').slice(0, 50).reduce((acc, t) => acc + t.quantity, 0);

  const stockData = products.slice(0, 10).map(p => ({
    name: p.name.substring(0, 15),
    qty: p.quantity
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recent Inward</p>
            <p className="text-2xl font-bold text-gray-900">+{recentIn}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <ArrowDownRight className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recent Outward</p>
            <p className="text-2xl font-bold text-gray-900">-{recentOut}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels (Top Items)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar dataKey="qty" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
           <div className="overflow-auto max-h-64">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-600 sticky top-0">
                 <tr>
                   <th className="pb-2 pl-2">Product</th>
                   <th className="pb-2">Type</th>
                   <th className="pb-2">Qty</th>
                   <th className="pb-2">Time</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {transactions.slice().reverse().map(t => (
                   <tr key={t.id}>
                     <td className="py-2 pl-2 font-medium text-gray-800">{t.productName}</td>
                     <td className="py-2">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                         {t.type}
                       </span>
                     </td>
                     <td className="py-2 text-gray-600">{t.quantity}</td>
                     <td className="py-2 text-gray-400 text-xs">
                       {new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </td>
                   </tr>
                 ))}
                 {transactions.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-400">No transactions yet</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};
