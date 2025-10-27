/**
 * Result table component for DataZen
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  Database,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Clock,
  Brain,
  CheckCircle,
  AlertTriangle,
  Zap,
  Lock
} from 'lucide-react';
import { ScrapeResponse, downloadUtils } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface ResultTableProps {
  result: ScrapeResponse;
  onNewScrape: () => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ result, onNewScrape }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user's plan supports CSV export
  const canExportCSV = user && (user.plan === 'pro' || user.plan === 'business');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return result.data;

    return result.data.filter((item: any) => {
      const searchableText = Object.values(item)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [result.data, searchTerm]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get column headers from data
  const columns = useMemo(() => {
    if (!result.data || result.data.length === 0) return [];

    const allKeys = new Set<string>();
    result.data.forEach((item: any) => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    return Array.from(allKeys);
  }, [result.data]);

  // Handle item selection
  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedData.map((_, index) => index)));
    }
  };

  // Download handlers
  const handleDownloadJSON = () => {
    const dataToDownload = selectedItems.size > 0
      ? paginatedData.filter((_, index) => selectedItems.has(index))
      : result.data;

    const exportData = {
      metadata: {
        url: result.url,
        original_url: result.original_url,
        data_type: result.data_type,
        count: dataToDownload.length,
        timestamp: result.timestamp,
        ai_processed: result.ai_processed,
        processing_time_seconds: result.processing_time_seconds
      },
      data: dataToDownload
    };

    const filename = `datazen-${result.data_type}-${new Date().toISOString().split('T')[0]}.json`;
    downloadUtils.downloadJSON(exportData, filename);
  };

  const handleDownloadCSV = () => {
    // Check if user's plan supports CSV export
    if (!canExportCSV) {
      setShowUpgradeModal(true);
      return;
    }

    const dataToDownload = selectedItems.size > 0
      ? paginatedData.filter((_, index) => selectedItems.has(index))
      : result.data;

    const filename = `datazen-${result.data_type}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadUtils.downloadCSV(dataToDownload, filename, result.data_type);
  };

  // Get enhanced data type badge
  const getDataTypeBadge = (item: any) => {
    const type = item.type || item.category || 'general';
    const badges: { [key: string]: { color: string; icon: string; label: string } } = {
      'profile_name': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: '👤', label: 'Profile' },
      'profile_headline': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: '💼', label: 'Headline' },
      'experience': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', icon: '🏢', label: 'Experience' },
      'company_name': { color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', icon: '🏢', label: 'Company' },
      'company_description': { color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', icon: '📄', label: 'Description' },
      'job_posting': { color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', icon: '💼', label: 'Job' },
      'social_post': { color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30', icon: '📱', label: 'Post' },
      'product_title': { color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: '🛒', label: 'Product' },
      'product_price': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', icon: '💰', label: 'Price' },
      'heading': { color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30', icon: '📝', label: 'Heading' },
      'paragraph': { color: 'bg-slate-500/20 text-slate-300 border border-slate-500/30', icon: '📄', label: 'Text' },
      'list_item': { color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30', icon: '📋', label: 'List' },
      'structured_data': { color: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: '🔧', label: 'Structured' },
      'meta_tag': { color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30', icon: '🏷️', label: 'Meta' }
    };

    const badge = badges[type] || { color: 'bg-slate-500/20 text-slate-300 border border-slate-500/30', icon: '📄', label: 'Content' };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  // Render cell content based on data type and column
  const renderCellContent = (item: any, column: string) => {
    const value = item[column];

    if (value === null || value === undefined) {
      return <span className="text-slate-600">—</span>;
    }

    // Handle URLs
    if (column.toLowerCase().includes('url') && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline flex items-center max-w-xs truncate transition-colors"
          title={value}
        >
          {value}
          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
        </a>
      );
    }

    // Handle email addresses
    if (column.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
      return (
        <a
          href={`mailto:${value}`}
          className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
        >
          {value}
        </a>
      );
    }

    // Handle type column with badges
    if (column === 'type' || column === 'category') {
      return getDataTypeBadge(item);
    }

    // Handle structured data
    if (column === 'raw_data' && typeof value === 'object') {
      return (
        <details className="cursor-pointer">
          <summary className="text-cyan-400 hover:text-cyan-300 transition-colors">View JSON</summary>
          <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-auto max-h-32 text-slate-300 border border-slate-700/50">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      );
    }

    // Handle long text
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div className="max-w-xs">
          <p className="truncate" title={value}>
            {value}
          </p>
        </div>
      );
    }

    return <span className="break-words">{String(value)}</span>;
  };

  if (!result.success) {
    return (
      <div className="backdrop-blur-md bg-slate-800/40 rounded-2xl shadow-2xl border border-red-500/30 p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
          <h3 className="text-lg font-semibold text-red-300">Extraction Failed</h3>
        </div>
        <p className="text-red-200 mb-4">{result.error}</p>
        <button
          onClick={onNewScrape}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-slate-800/40 rounded-2xl shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
            <h3 className="text-xl font-semibold text-slate-100">
              Extraction Results
            </h3>
            {result.ai_processed && (
              <span className="ml-3 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center border border-purple-500/30">
                <Brain className="w-3 h-3 mr-1" />
                Smart Analysis
              </span>
            )}
            {result.website_type && result.website_type !== 'general' && (
              <span className="ml-3 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center border border-cyan-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {result.website_type.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={onNewScrape}
            className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            New Extraction
          </button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-slate-400">
            <Database className="w-4 h-4 mr-2 text-cyan-400" />
            <span>{result.count} {result.data_type} items found</span>
          </div>
          <div className="flex items-center text-slate-400">
            <Clock className="w-4 h-4 mr-2 text-cyan-400" />
            <span>{result.processing_time_seconds}s processing time</span>
          </div>
          <div className="flex items-center text-slate-400">
            <ExternalLink className="w-4 h-4 mr-2 text-cyan-400" />
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline truncate max-w-xs transition-colors"
            >
              {result.url}
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-700/50 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={!canExportCSV}
              title={!canExportCSV ? 'CSV export available in Pro and Business plans' : 'Download as CSV'}
              className={`flex items-center px-4 py-2 rounded-lg transition-all shadow-lg ${
                canExportCSV
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/30 cursor-pointer'
                  : 'bg-slate-700/50 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {!canExportCSV ? (
                <Lock className="w-4 h-4 mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/30"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </button>
          </div>
        </div>

        {/* Items per page */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-700/50 rounded px-2 py-1 bg-slate-800/50 text-slate-100"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>items per page</span>
          </div>

          {selectedItems.size > 0 && (
            <div className="text-sm text-cyan-400">
              {selectedItems.size} item(s) selected
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={selectAll}
                    className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                  >
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${selectedItems.has(index) ? 'bg-cyan-500/10' : 'hover:bg-slate-800/30'}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => toggleItemSelection(index)}
                      className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 text-sm text-slate-300">
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No results found matching your search.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-700/50 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/50 transition-colors"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded text-sm transition-all ${currentPage === pageNum
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500'
                    : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-700/50 rounded text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CSV Export Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 text-center mb-2">CSV Export</h3>
            <p className="text-slate-400 text-center mb-6">
              CSV export is available in <span className="font-semibold text-cyan-400">Pro</span> and <span className="font-semibold text-purple-400">Business</span> plans.
            </p>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-400">Your current plan: <span className="font-semibold text-cyan-400 capitalize">{user?.plan || 'Free'}</span></p>
              <p className="text-sm text-slate-400">JSON export is available in all plans.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/billing"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all text-center font-medium"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultTable;
