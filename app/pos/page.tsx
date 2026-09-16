'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, Customer, CartItem, Sale, Store } from '@/lib/types';
import { INITIAL_STORE, INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SALES } from '@/lib/mock-data';
import { queueOfflineSale } from '@/lib/offline-sync';
import CheckoutModal from '@/components/pos/CheckoutModal';
import { 
  Search, 
  Barcode, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Percent, 
  Receipt, 
  Package, 
  AlertTriangle,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function POSPage() {
  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [showCheckout, setShowCheckout] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Audio Synthesizer Beep for Barcode Scans
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch {
      // Audio fallback
    }
  };

  // Keyboard Shortcuts Listener (F2: Search, F9: Checkout, Esc: Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowCheckout(true);
        } else {
          toast.warning('Cart is empty!');
        }
      } else if (e.key === 'Escape') {
        if (showCheckout) {
          setShowCheckout(false);
        } else if (cart.length > 0) {
          setCart([]);
          toast.info('Cart cleared');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showCheckout]);

  // Barcode exact match listener on typing barcode
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);

    // Exact barcode match search
    const exactMatch = products.find(
      (p) => p.barcode.toLowerCase() === val.trim().toLowerCase()
    );
    if (exactMatch) {
      addToCart(exactMatch);
      playBeep();
      setSearchQuery('');
      toast.success(`Scanned: ${exactMatch.name}`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock_qty <= 0) {
      toast.error(`Out of stock: ${product.name}`);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIdx].quantity;
        if (currentQty >= product.stock_qty) {
          toast.warning(`Maximum available stock reached (${product.stock_qty})`);
          return prev;
        }
        updated[existingIdx].quantity += 1;
        updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].unit_price;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unit_price: product.price,
          discount: 0,
          subtotal: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock_qty) {
              toast.warning(`Stock limit reached (${item.product.stock_qty})`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unit_price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = (subtotal * store.tax_rate) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Filter products by search and category
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCompleteSale = async (saleData: {
    paymentMethod: 'cash' | 'card' | 'khata';
    customerId?: string;
    customerName?: string;
    amountPaid: number;
  }): Promise<Sale | null> => {
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      store_id: store.id,
      customer_id: saleData.customerId,
      customer_name: saleData.customerName,
      invoice_no: invoiceNo,
      subtotal,
      tax_amount: taxAmount,
      discount: discountAmount,
      total_amount: grandTotal,
      payment_method: saleData.paymentMethod,
      fbr_status: 'pending',
      items: cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.product.cost_price,
        subtotal: item.subtotal,
      })),
      created_at: new Date().toISOString(),
    };

    // Deduct stock locally
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          return { ...p, stock_qty: p.stock_qty - cartItem.quantity };
        }
        return p;
      })
    );

    // Update customer Khata if credit sale
    if (saleData.paymentMethod === 'khata' && saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === saleData.customerId) {
            return { ...c, current_balance: c.current_balance + grandTotal };
          }
          return c;
        })
      );
    }

    // Call FBR API Proxy
    try {
      const fbrRes = await fetch('/api/fbr/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale: newSale, store }),
      });

      if (fbrRes.ok) {
        const fbrData = await fbrRes.json();
        newSale.fbr_invoice_no = fbrData.fbr_invoice_no;
        newSale.fbr_status = 'synced';
      }
    } catch {
      newSale.fbr_status = 'pending';
      queueOfflineSale(newSale);
    }

    setCart([]);
    setDiscountAmount(0);
    return newSale;
  };

  return (
    <div className="h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT COLUMN: Product Catalog & Search (Cols 7) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
        {/* Top Search & Barcode Listener Bar */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Scan Barcode or Search Product Name (F2)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-xl border border-emerald-200 shrink-0">
            <Barcode className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Barcode Ready</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock_qty <= product.min_stock_alert;
            const isOutOfStock = product.stock_qty <= 0;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative group ${
                  isOutOfStock
                    ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                    {isLowStock && !isOutOfStock && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Low
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    #{product.barcode}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    PKR {product.price.toLocaleString('en-PK')}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isOutOfStock
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOutOfStock ? 'No Stock' : `${product.stock_qty} in stock`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Fast Cart & Checkout Panel (Cols 5) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Billing Cart</h2>
              <p className="text-[11px] text-slate-400">{cart.length} item(s) selected</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Package className="w-12 h-12 text-slate-200 mb-2" />
              <p className="font-bold text-sm text-slate-600">Cart is empty</p>
              <p className="text-xs mt-0.5">Scan a barcode or click any product to add items</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>PKR {item.unit_price.toLocaleString()}</span>
                    <span>x</span>
                    <span className="font-bold text-slate-700">{item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="font-bold text-slate-900 text-xs block">
                      PKR {item.subtotal.toLocaleString('en-PK')}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Footer */}
        <div className="border-t border-slate-200 pt-3 space-y-2 shrink-0 bg-slate-50/50 p-3 rounded-xl">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-800">
              PKR {subtotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span>FBR GST ({store.tax_rate}%):</span>
            <span className="font-bold text-slate-800">
              PKR {taxAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Discount Input */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Discount (PKR):
            </span>
            <input
              type="number"
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-20 bg-white border border-slate-300 rounded px-2 py-0.5 text-right font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>GRAND TOTAL:</span>
            <span className="text-emerald-700">
              PKR {grandTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => {
              if (cart.length === 0) {
                toast.warning('Cart is empty!');
                return;
              }
              setShowCheckout(true);
            }}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Receipt className="w-5 h-5" />
            Proceed to Checkout (F9)
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          taxAmount={taxAmount}
          discount={discountAmount}
          grandTotal={grandTotal}
          store={store}
          customers={customers}
          onCompleteSale={handleCompleteSale}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
