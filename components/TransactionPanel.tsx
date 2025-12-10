import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Search, PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';

interface TransactionPanelProps {
  products: Product[];
  onTransaction: (productId: string, type: 'IN' | 'OUT', quantity: number) => void;
}

export const TransactionPanel: React.FC<TransactionPanelProps> = ({ products, onTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.sku.toLowerCase().includes(lower)
    ).slice(0, 5); // Limit results
  }, [products, searchTerm]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(''); // Clear search to hide dropdown
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && quantity > 0) {
      onTransaction(selectedProduct.id, type, quantity);
      setSuccessMsg(`Successfully ${type === 'IN' ? 'added' : 'removed'} ${quantity} items of ${selectedProduct.name}`);
      
      // Reset
      setSelectedProduct(null);
      setQuantity(1);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Inward / Outward Entry</h2>
        <p className="text-gray-500 mt-2">Manage stock movements quickly from the reception desk.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Search Section */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Product Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Start typing name (e.g. 'Wireless Mouse')..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={selectedProduct ? selectedProduct.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedProduct) setSelectedProduct(null); // Deselect if typing
                }}
              />
            </div>

            {/* Dropdown Results */}
            {filteredProducts.length > 0 && !selectedProduct && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-indigo-700">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">
                      Qty: {product.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="animate-fade-in-up">
              {/* Product Info Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-start space-x-4">
                 <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">Current Stock: <span className="font-bold text-gray-900">{selectedProduct.quantity}</span></span>
                        <span className="text-gray-600">Price: <span className="font-bold text-gray-900">${selectedProduct.price}</span></span>
                    </div>
                 </div>
              </div>

              {/* Action Type */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setType('IN')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    type === 'IN' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-100 hover:border-green-200 text-gray-600'
                  }`}
                >
                  <PlusCircle className={`w-6 h-6 ${type === 'IN' ? 'fill-current' : ''}`} />
                  <span className="font-bold">INWARD (Stock In)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('OUT')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    type === 'OUT' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-100 hover:border-orange-200 text-gray-600'
                  }`}
                >
                  <MinusCircle className={`w-6 h-6 ${type === 'OUT' ? 'fill-current' : ''}`} />
                  <span className="font-bold">OUTWARD (Stock Out)</span>
                </button>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                  >-</button>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 h-12 text-center text-xl font-bold border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                  >+</button>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform active:scale-95 ${
                    type === 'IN' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                }`}
              >
                Confirm {type === 'IN' ? 'Entry' : 'Exit'}
              </button>
            </div>
          )}
        </form>

        {/* Success Feedback */}
        {successMsg && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-xl flex items-center justify-center space-x-2 animate-bounce">
            <CheckCircle className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
