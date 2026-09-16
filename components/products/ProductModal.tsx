'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { X, Barcode, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product?: Product | null;
  onSave: (productData: Partial<Product>) => void;
  onClose: () => void;
}

export default function ProductModal({
  product,
  onSave,
  onClose,
}: ProductModalProps) {
  const [name, setName] = useState(product?.name || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [category, setCategory] = useState(product?.category || 'General');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '');
  const [costPrice, setCostPrice] = useState(product?.cost_price ? String(product.cost_price) : '');
  const [stockQty, setStockQty] = useState(product?.stock_qty ? String(product.stock_qty) : '');
  const [minStockAlert, setMinStockAlert] = useState(product?.min_stock_alert ? String(product.min_stock_alert) : '10');
  const [expiryDate, setExpiryDate] = useState(product?.expiry_date || '');
  const [batchNo, setBatchNo] = useState(product?.batch_no || '');

  const generateRandomBarcode = () => {
    // Generate Pakistan EAN-13 barcode format (8964000XXXXXX)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newBarcode = `8964000${randomDigits}`;
    setBarcode(newBarcode);
    toast.info(`Generated barcode: ${newBarcode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode || !price) {
      toast.error('Product Name, Barcode, and Price are required!');
      return;
    }

    onSave({
      id: product?.id,
      name,
      barcode,
      category,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      stock_qty: parseInt(stockQty, 10) || 0,
      min_stock_alert: parseInt(minStockAlert, 10) || 5,
      expiry_date: expiryDate || null,
      batch_no: batchNo || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-400" />
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Panadol Extra 500mg"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Barcode with Auto-Generate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Barcode / SKU *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8964000123456"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={generateRandomBarcode}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Generate
              </button>
            </div>
          </div>

          {/* Category & Batch No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="General">General</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Grocery">Grocery</option>
                <option value="Spices">Spices</option>
                <option value="Household">Household</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch No (Optional)
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="e.g. B2408"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Selling Price & Cost Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (PKR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cost Price (PKR)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="380"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Stock Qty & Low Stock Alert Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock Qty
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="50"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Alert Limit
              </label>
              <input
                type="number"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                placeholder="10"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Expiry Date (Pharmacy / Grocery) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expiry Date (Pharmacy Alert Trigger)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
