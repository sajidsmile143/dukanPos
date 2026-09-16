'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import ProductModal from '@/components/products/ProductModal';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Edit3, 
  Trash2, 
  Barcode, 
  Filter,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'expiring'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper check for expiring soon (< 30 days)
  const isExpiringSoon = (expiryDate?: string | null) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? ({ ...p, ...productData } as Product)
            : p
        )
      );
      toast.success(`Updated ${productData.name}`);
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        store_id: '00000000-0000-0000-0000-000000000001',
        name: productData.name || 'New Item',
        barcode: productData.barcode || `8964000${Math.floor(100000 + Math.random() * 900000)}`,
        category: productData.category || 'General',
        price: productData.price || 0,
        cost_price: productData.cost_price || 0,
        stock_qty: productData.stock_qty || 0,
        min_stock_alert: productData.min_stock_alert || 10,
        expiry_date: productData.expiry_date || null,
        batch_no: productData.batch_no || null,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`Added new product ${newProduct.name}`);
      setShowAddModal(false);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Deleted ${name}`);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'low_stock') {
      return matchesSearch && p.stock_qty <= p.min_stock_alert;
    }
    if (filterType === 'expiring') {
      return matchesSearch && isExpiringSoon(p.expiry_date);
    }
    return matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.stock_qty <= p.min_stock_alert).length;
  const expiringCount = products.filter((p) => isExpiringSoon(p.expiry_date)).length;

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage product catalog, stock levels, barcodes, and pharmacy expiry dates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter Tabs & Live Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, Barcode, Category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>

          <button
            onClick={() => setFilterType('low_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterType === 'low_stock'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock ({lowStockCount})
          </button>

          <button
            onClick={() => setFilterType('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterType === 'expiring'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Expiring Soon ({expiringCount})
          </button>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Barcode / SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-right">Cost Price</th>
                <th className="p-3.5 text-center">Stock Level</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock_qty <= p.min_stock_alert;
                  const isExpiring = isExpiringSoon(p.expiry_date);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.batch_no && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Batch: {p.batch_no}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-semibold">
                        {p.barcode}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900">
                        PKR {p.price.toLocaleString('en-PK')}
                      </td>
                      <td className="p-3.5 text-right text-slate-500">
                        PKR {p.cost_price.toLocaleString('en-PK')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          p.stock_qty <= 0
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stock_qty} in stock
                        </span>
                      </td>
                      <td className="p-3.5">
                        {p.expiry_date ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isExpiring ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200' : 'text-slate-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {p.expiry_date}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
