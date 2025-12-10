import React, { useState, useEffect } from 'react';
import { ViewState, Product, Transaction } from './types';
import { LayoutDashboard, ShoppingBag, ArrowRightLeft, Wand2, Plus, Menu, X, Save, Download, Monitor, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/InventoryManager';
import { TransactionPanel } from './components/TransactionPanel';
import { AIImageEditor } from './components/AIImageEditor';
import { LoginScreen } from './components/LoginScreen';
import * as XLSX from 'xlsx';

// Mock Data
const INITIAL_PRODUCTS: Product[] = [];

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('storeflow_user');
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // App Data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('storeflow_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('storeflow_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // File System State
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodQuantity, setProdQuantity] = useState('');
  const [prodImage, setProdImage] = useState('');

  // --- Effects ---

  // PWA Install Prompt Listener
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  // Auto-Save to Local Storage (Backup)
  useEffect(() => {
    localStorage.setItem('storeflow_products', JSON.stringify(products));
    setUnsavedChanges(true); // Mark as modified
  }, [products]);

  useEffect(() => {
    localStorage.setItem('storeflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auth Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('storeflow_user', currentUser);
    } else {
      localStorage.removeItem('storeflow_user');
    }
  }, [currentUser]);

  // --- File System Access API (Z: Drive Logic) ---

  const handleConnectDrive = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        // @ts-ignore - File System Access API
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Excel Spreadsheets',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
          }],
          multiple: false
        });
        
        setFileHandle(handle);
        const file = await handle.getFile();
        await handleImportExcel(file); // Load data from file
        setUnsavedChanges(false); // Reset unsaved flag as we just loaded
      } else {
        alert("Your browser doesn't support direct Z: Drive syncing. Please use Chrome, Edge, or install the app on Windows.");
        // Fallback to simple upload if needed, but we encourage the "App" flow
        document.getElementById('fallback-upload')?.click();
      }
    } catch (err) {
      console.error("File Access Error:", err);
      // User cancelled picker
    }
  };

  const handleSaveToDrive = async () => {
    if (!products.length) return;

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(products.map(p => ({
      ID: p.id,
      'Product Name': p.name,
      SKU: p.sku,
      Category: p.category,
      Quantity: p.quantity,
      Price: p.price,
      'Min Level': p.minLevel,
      'Image URL': p.imageUrl
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Master");
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    try {
      if (fileHandle) {
        // Save directly to the open handle (Z: Drive file)
        // @ts-ignore
        const writable = await fileHandle.createWritable();
        await writable.write(wbout);
        await writable.close();
        setUnsavedChanges(false);
        alert("Synced successfully to Z: Drive!");
      } else {
        // Fallback: Download file
        handleExportExcel();
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save to Z: Drive. Ensure you have permission.");
    }
  };

  // --- Logic ---

  const handleLogin = (email: string) => {
    setCurrentUser(email);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
        setCurrentUser(null);
        setFileHandle(null); // Disconnect drive on logout for security
    }
  };

  const handleInstallApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const handleTransaction = (productId: string, type: 'IN' | 'OUT', quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          quantity: type === 'IN' ? p.quantity + quantity : Math.max(0, p.quantity - quantity)
        };
      }
      return p;
    }));

    const product = products.find(p => p.id === productId);
    setTransactions(prev => [...prev, {
      id: Date.now().toString(),
      productId,
      productName: product?.name || 'Unknown',
      type,
      quantity,
      timestamp: Date.now()
    }]);
  };

  const openAddModal = () => {
    setEditingId(null);
    setProdName('');
    setProdCategory('');
    setProdPrice('');
    setProdQuantity('0');
    setProdSku(`SKU-${Math.floor(Math.random() * 10000)}`);
    setProdImage('');
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setProdName(product.name);
    setProdCategory(product.category);
    setProdPrice(product.price.toString());
    setProdQuantity(product.quantity.toString());
    setProdSku(product.sku);
    setProdImage(product.imageUrl || '');
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearInventory = () => {
    setProducts([]);
  };

  const handleSaveProduct = () => {
    if (!prodName) return;

    if (editingId) {
      setProducts(prev => prev.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            name: prodName,
            category: prodCategory || 'General',
            price: parseFloat(prodPrice) || 0,
            quantity: parseInt(prodQuantity) || 0,
            sku: prodSku,
            imageUrl: prodImage
          };
        }
        return p;
      }));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: prodName,
        category: prodCategory || 'General',
        price: parseFloat(prodPrice) || 0,
        quantity: parseInt(prodQuantity) || 0,
        minLevel: 5,
        sku: prodSku || `SKU-${Math.floor(Math.random() * 10000)}`,
        imageUrl: prodImage || `https://picsum.photos/200/200?random=${Date.now()}`
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    setShowProductModal(false);
  };

  const handleImportExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importedProducts: Product[] = jsonData.map((row: any, index) => {
        const findVal = (keys: string[]) => {
            for (const key of keys) {
                if (row[key] !== undefined) return row[key];
                const lowerKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
                if (lowerKey) return row[lowerKey];
            }
            return undefined;
        };
        return {
          id: String(findVal(['ID', 'Id']) || Date.now() + index),
          name: String(findVal(['Name', 'Product', 'Item Name']) || 'Untitled').trim(),
          sku: String(findVal(['SKU', 'Code']) || `IMP-${Date.now()}-${index}`).trim(),
          category: String(findVal(['Category', 'Group']) || 'Uncategorized').trim(),
          quantity: Number(findVal(['Quantity', 'Qty', 'Stock']) || 0),
          minLevel: 5,
          price: Number(findVal(['Price', 'Rate']) || 0),
          imageUrl: String(findVal(['Image', 'Image URL']) || '').trim(),
        };
      });

      if (importedProducts.length > 0) {
         setProducts(importedProducts);
         // Don't alert if loading via "Connect Drive", handle that in caller
      }
    } catch (error) {
      console.error("Import Error:", error);
      alert('Failed to parse Excel file.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products.map(p => ({
      ID: p.id,
      'Product Name': p.name,
      SKU: p.sku,
      Category: p.category,
      Quantity: p.quantity,
      Price: p.price,
      'Min Level': p.minLevel,
      'Image URL': p.imageUrl
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Master");
    XLSX.writeFile(workbook, `StoreFlow_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  // --- Auth Guard ---
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed h-full z-20 shadow-sm">
        <div className="p-8">
          <div className="flex items-center space-x-2 text-indigo-600">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
                <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">StoreFlow</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">Desktop Inventory System</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Overview" />
          <NavItem view={ViewState.TRANSACTION} icon={ArrowRightLeft} label="Reception (In/Out)" />
          <NavItem view={ViewState.INVENTORY} icon={ShoppingBag} label="Master Inventory" />
          <NavItem view={ViewState.AI_EDITOR} icon={Wand2} label="AI Product Studio" />
        </nav>

        {/* PWA Install Promo */}
        {installPrompt && (
            <div className="px-4 pb-4">
                <button onClick={handleInstallApp} className="w-full bg-gray-900 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors">
                    <Monitor className="w-4 h-4" />
                    <span>Install App</span>
                </button>
            </div>
        )}

        {/* Logout Button */}
        <div className="px-4 pb-4">
            <button onClick={handleLogout} className="w-full text-red-600 hover:bg-red-50 p-3 rounded-xl flex items-center gap-3 transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
            </button>
        </div>

        {/* Status Bar (Simulated) */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
             <span>v2.2.0</span>
             <span className={fileHandle ? "text-green-600 font-bold" : "text-gray-400"}>
                {fileHandle ? "● Z: Drive Connected" : "● Local Mode"}
             </span>
        </div>
      </aside>

      {/* Mobile Sidebar & Header Logic omitted for brevity, keeping existing structure basically */}
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
         <div className="p-6 flex justify-between items-center border-b border-gray-100">
             <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" /> StoreFlow
             </span>
             <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
         </div>
         <nav className="p-4 space-y-2">
            <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={ViewState.TRANSACTION} icon={ArrowRightLeft} label="Reception (In/Out)" />
            <NavItem view={ViewState.INVENTORY} icon={ShoppingBag} label="Master Sheet" />
            <NavItem view={ViewState.AI_EDITOR} icon={Wand2} label="AI Product Studio" />
            <div className="h-px bg-gray-100 my-2"></div>
            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl">
               <LogOut className="w-5 h-5" /> Log Out
            </button>
            {installPrompt && (
                <button onClick={handleInstallApp} className="w-full mt-4 bg-gray-900 text-white p-3 rounded-xl flex items-center justify-center gap-2">
                    <Monitor className="w-4 h-4" /> Install Windows App
                </button>
            )}
         </nav>
      </div>

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-16 flex items-center px-6 justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">
                    {currentView === ViewState.DASHBOARD && 'Overview'}
                    {currentView === ViewState.INVENTORY && 'Inventory Master Sheet'}
                    {currentView === ViewState.TRANSACTION && 'Reception Desk'}
                    {currentView === ViewState.AI_EDITOR && 'AI Studio'}
                </h1>
            </div>
            
            <div className="flex items-center space-x-4">
                {fileHandle && (
                    <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                        <Save className="w-3 h-3" /> Auto-Sync Active
                    </span>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
                   <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-gray-900">{currentUser}</p>
                      <p className="text-xs text-indigo-600">Authorized User</p>
                   </div>
                   <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 text-sm uppercase">
                       {currentUser ? currentUser.substring(0, 2) : 'US'}
                   </div>
                </div>
            </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
           {currentView === ViewState.DASHBOARD && <Dashboard products={products} transactions={transactions} />}
           {currentView === ViewState.INVENTORY && (
                <InventoryManager 
                    products={products} 
                    fileHandleName={fileHandle ? fileHandle.name : null}
                    unsavedChanges={unsavedChanges}
                    onAddProduct={openAddModal}
                    onImportExcel={(f) => handleImportExcel(f)}
                    onConnectDrive={handleConnectDrive}
                    onSaveToDrive={handleSaveToDrive}
                    onExportExcel={handleExportExcel}
                    onEditProduct={openEditModal}
                    onDeleteProduct={handleDeleteProduct}
                    onClearInventory={handleClearInventory}
                />
           )}
           {currentView === ViewState.TRANSACTION && <TransactionPanel products={products} onTransaction={handleTransaction} />}
           {currentView === ViewState.AI_EDITOR && <AIImageEditor onSave={(url) => {
               setProdImage(url);
               openAddModal();
           }} />}
        </div>
      </main>

      {/* Reused Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProductModal(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 p-8 animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={() => setShowProductModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-xl font-bold mb-1 text-gray-900">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <div className="space-y-4 mt-6">
                    {prodImage && (
                        <div className="mb-4 text-center">
                            <img src={prodImage} alt="Preview" className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50 mx-auto" />
                            <button onClick={() => setProdImage('')} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={prodName} onChange={(e) => setProdName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" value={prodSku} onChange={(e) => setProdSku(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($)</label>
                            <input type="number" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                        <input type="number" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={prodQuantity} onChange={(e) => setProdQuantity(e.target.value)} />
                    </div>
                    <button onClick={handleSaveProduct} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                        {editingId ? 'Update & Sync' : 'Add to Inventory'}
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {/* Hidden Fallback Input */}
      <input type="file" id="fallback-upload" className="hidden" accept=".xlsx" onChange={(e) => e.target.files && handleImportExcel(e.target.files[0])} />
    </div>
  );
};

export default App;