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
  Zap
} from 'lucide-react';
import { ScrapeResponse, downloadUtils } from '@/lib/api';

interface ResultTableProps {
  result: ScrapeResponse;
  onNewScrape: () => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ result, onNewScrape }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

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
      'profile_name': { color: 'bg-blue-100 text-blue-800', icon: '👤', label: 'Profile' },
      'profile_headline': { color: 'bg-blue-100 text-blue-800', icon: '💼', label: 'Headline' },
      'experience': { color: 'bg-green-100 text-green-800', icon: '🏢', label: 'Experience' },
      'company_name': { color: 'bg-purple-100 text-purple-800', icon: '🏢', label: 'Company' },
      'company_description': { color: 'bg-purple-100 text-purple-800', icon: '📄', label: 'Description' },
      'job_posting': { color: 'bg-orange-100 text-orange-800', icon: '💼', label: 'Job' },
      'social_post': { color: 'bg-pink-100 text-pink-800', icon: '📱', label: 'Post' },
      'product_title': { color: 'bg-yellow-100 text-yellow-800', icon: '🛒', label: 'Product' },
      'product_price': { color: 'bg-green-100 text-green-800', icon: '💰', label: 'Price' },
      'heading': { color: 'bg-indigo-100 text-indigo-800', icon: '📝', label: 'Heading' },
      'paragraph': { color: 'bg-gray-100 text-gray-800', icon: '📄', label: 'Text' },
      'list_item': { color: 'bg-cyan-100 text-cyan-800', icon: '📋', label: 'List' },
      'structured_data': { color: 'bg-red-100 text-red-800', icon: '🔧', label: 'Structured' },
      'meta_tag': { color: 'bg-teal-100 text-teal-800', icon: '🏷️', label: 'Meta' }
    };

    const badge = badges[type] || { color: 'bg-gray-100 text-gray-800', icon: '📄', label: 'Content' };

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
      return <span className="text-gray-400">—</span>;
    }

    // Handle URLs
    if (column.toLowerCase().includes('url') && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline flex items-center max-w-xs truncate"
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
          className="text-blue-600 hover:text-blue-800 underline"
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
          <summary className="text-blue-600 hover:text-blue-800">View JSON</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
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
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Scraping Failed</h3>
        </div>
        <p className="text-red-700 mb-4">{result.error}</p>
        <button
          onClick={onNewScrape}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              Scraping Results
            </h3>
            {result.ai_processed && (
              <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                <Brain className="w-3 h-3 mr-1" />
                AI Processed
              </span>
            )}
            {result.website_type && result.website_type !== 'general' && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {result.website_type.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={onNewScrape}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            New Scrape
          </button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Database className="w-4 h-4 mr-2" />
            <span>{result.count} {result.data_type} items found</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{result.processing_time_seconds}s processing time</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ExternalLink className="w-4 h-4 mr-2" />
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs"
            >
              {result.url}
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </button>
          </div>
        </div>

        {/* Items per page */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>items per page</span>
          </div>

          {selectedItems.size > 0 && (
            <div className="text-sm text-gray-600">
              {selectedItems.size} item(s) selected
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${selectedItems.has(index) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => toggleItemSelection(index)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 text-sm text-gray-900">
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
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No results found matching your search.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                  className={`px-3 py-1 border rounded text-sm ${currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultTable;
