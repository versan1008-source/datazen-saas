'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  FileText,
  ExternalLink,
  ChevronDown,
  X,
  Phone,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';
import { downloadUtils } from '@/lib/api';

interface PhoneRecord {
  phone: string;
  normalized: string;
  owner: string;
  owner_type: 'Person' | 'Business' | 'Unknown';
  confidence: number;
  source: string;
  context_snippet: string;
  data_source: string;
  carrier?: string;
  line_type?: string;
  website?: string;
}

interface PhoneNumbersTableProps {
  data: PhoneRecord[];
  onNewScrape: () => void;
}

const PhoneNumbersTable: React.FC<PhoneNumbersTableProps> = ({ data, onNewScrape }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'All' | 'Person' | 'Business' | 'Unknown'>('All');
  const [sortBy, setSortBy] = useState<'confidence' | 'phone'>('confidence');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = data.filter((item) => {
      const matchesSearch =
        item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = ownerTypeFilter === 'All' || item.owner_type === ownerTypeFilter;
      return matchesSearch && matchesFilter;
    });

    // Sort
    if (sortBy === 'confidence') {
      result.sort((a, b) => b.confidence - a.confidence);
    } else {
      result.sort((a, b) => a.phone.localeCompare(b.phone));
    }

    return result;
  }, [data, searchTerm, ownerTypeFilter, sortBy]);

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map((_, i) => i)));
    }
  };

  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleDownloadCSV = () => {
    const dataToDownload = selectedItems.size > 0
      ? filteredData.filter((_, index) => selectedItems.has(index))
      : filteredData;
    const filename = `datazen-phone-numbers-${new Date().toISOString().split('T')[0]}.csv`;
    downloadUtils.downloadCSV(dataToDownload, filename, 'phone_numbers');
  };

  const handleDownloadJSON = () => {
    const dataToDownload = selectedItems.size > 0
      ? filteredData.filter((_, index) => selectedItems.has(index))
      : filteredData;
    const filename = `datazen-phone-numbers-${new Date().toISOString().split('T')[0]}.json`;
    downloadUtils.downloadJSON(dataToDownload, filename);
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  };

  const getOwnerTypeIcon = (type: string) => {
    switch (type) {
      case 'Person':
        return <User className="w-4 h-4" />;
      case 'Business':
        return <Building2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="backdrop-blur-md bg-slate-800/40 rounded-2xl shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Phone className="w-6 h-6 text-cyan-400 mr-2" />
            <h3 className="text-xl font-semibold text-slate-100">Phone Numbers</h3>
            <span className="ml-3 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
              {filteredData.length} found
            </span>
          </div>
          <button
            onClick={onNewScrape}
            className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            New Extraction
          </button>
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
              placeholder="Search phone or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-700/50 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Filter and Download */}
          <div className="flex items-center gap-2">
            <select
              value={ownerTypeFilter}
              onChange={(e) => setOwnerTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-700/50 rounded-lg bg-slate-800/50 text-slate-100 text-sm"
            >
              <option value="All">All Types</option>
              <option value="Person">Person</option>
              <option value="Business">Business</option>
              <option value="Unknown">Unknown</option>
            </select>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-green-500/30"
            >
              <FileText className="w-4 h-4 mr-2" />
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

        {selectedItems.size > 0 && (
          <div className="mt-3 text-sm text-cyan-400">
            {selectedItems.size} item(s) selected
          </div>
        )}
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
                    checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                  onClick={() => setSortBy(sortBy === 'confidence' ? 'phone' : 'confidence')}
                >
                  Confidence {sortBy === 'confidence' && '↓'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredData.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="transition-colors hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => toggleItemSelection(index)}
                        className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{item.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.owner}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg">
                        {getOwnerTypeIcon(item.owner_type)}
                        {item.owner_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getConfidenceBadgeColor(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate" title={item.context_snippet}>
                      {item.context_snippet}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedRow === index ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="bg-slate-800/20">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-2 text-sm">
                          <div><span className="text-slate-400">Source:</span> <span className="text-slate-300">{item.source}</span></div>
                          <div><span className="text-slate-400">Data Source:</span> <span className="text-slate-300">{item.data_source}</span></div>
                          {item.carrier && <div><span className="text-slate-400">Carrier:</span> <span className="text-slate-300">{item.carrier}</span></div>}
                          {item.line_type && <div><span className="text-slate-400">Line Type:</span> <span className="text-slate-300">{item.line_type}</span></div>}
                          {item.website && <div><span className="text-slate-400">Website:</span> <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300"><ExternalLink className="w-3 h-3 inline mr-1" />{item.website}</a></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <Phone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No phone numbers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default PhoneNumbersTable;

