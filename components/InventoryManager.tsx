import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Search, Plus, Edit3, Trash2, FileSpreadsheet, Download, Upload, AlertTriangle, Database, Save, FolderOpen, RefreshCw } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  fileHandleName: string | null;
  unsavedChanges: boolean;
  onAddProduct: () => void;
  onImportExcel: (file: File) => void;
  onConnectDrive: () => void;
  onSaveToDrive: () => void;
  onExportExcel: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onClearInventory: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  products, 
  fileHandleName,
  unsavedChanges,
  onAddProduct, 
  onImportExcel, 
  onConnectDrive,
  onSaveToDrive,
  onExportExcel,
  onEditProduct,
  onDeleteProduct,
  onClearInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportExcel(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the master sheet?`)) {
      onDeleteProduct(id);
    }
  };

  const confirmClear = () => {
    if (window.confirm("WARNING: This will delete ALL products. Are you sure?")) {
      onClearInventory();
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top Toolbar - Designed like Desktop App Ribbon */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        
        {/* Left: Status / Connection Info */}
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${fileHandleName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Database className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-900">Master Sheet</h2>
             <div className="flex items-center gap-2 mt-1">
                {fileHandleName ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        <FolderOpen className="w-3 h-3" />
                        Connected: {fileHandleName}
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        <AlertTriangle className="w-3 h-3" />
                        Using Browser Storage (Not Synced)
                    </span>
                )}
                {unsavedChanges && (
                    <span className="text-xs text-red-500 font-bold animate-pulse">• Unsaved Changes</span>
                )}
             </div>
           </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
            />

            {/* Manual Upload Button (Restored) */}
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                title="Upload an Excel file (No Sync)"
            >
                <Upload className="w-4 h-4" />
                Upload Sheet
            </button>

            {/* Z Drive Connection Button */}
            <button 
                onClick={onConnectDrive}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border shadow-sm ${
                    fileHandleName 
                    ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' 
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
                title="Connect to the Excel file on your Z: Drive for Sync"
            >
                <FolderOpen className="w-4 h-4" />
                {fileHandleName ? 'Switch File' : 'Connect Z: Drive'}
            </button>

            {/* Save Button */}
            <button 
                onClick={onSaveToDrive}
                disabled={!unsavedChanges && !!fileHandleName}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border shadow-sm ${
                    unsavedChanges 
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-green-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
                title={fileHandleName ? "Save changes directly to Z: Drive file" : "Export a copy to your computer"}
            >
                <Save className="w-4 h-4" />
                {fileHandleName ? 'Save Sync' : 'Save Copy'}
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
            
            <button 
                onClick={confirmClear}
                className="p-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear All Data"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <button 
                onClick={onAddProduct}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-indigo-200"
            >
                <Plus className="w-5 h-5" />
                Add Item
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
        {/* Filters */}
        <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Name, SKU, Category..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center px-2">
            {filteredProducts.length} Records
          </div>
        </div>

        {/* Table - Dense Mode for "App" feel */}
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600 relative">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-xs sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 w-16">Img</th>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50">Product Name</th>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50">Category</th>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-center">Stock</th>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-right">Price</th>
                        <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                             <td className="px-4 py-2">
                                <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-2">
                                <div className="font-semibold text-gray-900">{product.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{product.sku}</div>
                            </td>
                            <td className="px-4 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                                <div className={`inline-block w-12 py-0.5 rounded text-center font-bold text-xs ${
                                    product.quantity <= product.minLevel 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                    {product.quantity}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-gray-900">
                                ${product.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onEditProduct(product)}
                                        className="p-1.5 hover:bg-indigo-100 rounded text-indigo-600 transition-colors" 
                                        title="Edit"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => confirmDelete(product.id, product.name)}
                                        className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors" 
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <FileSpreadsheet className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-xl font-medium text-gray-600">No Inventory Found</p>
                                    <p className="text-sm mb-6 max-w-xs mx-auto mt-2">Upload a master sheet or connect to Z: Drive.</p>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold shadow-sm flex items-center gap-2"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Upload Excel
                                        </button>
                                        <button 
                                            onClick={onConnectDrive}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center gap-2"
                                        >
                                            <FolderOpen className="w-5 h-5" />
                                            Connect Z: Drive
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};