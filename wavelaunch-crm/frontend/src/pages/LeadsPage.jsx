import React, { useEffect, useState } from 'react';
import { leadsAPI } from '../services/api';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

/**
 * Leads Page
 *
 * Displays all lead applications with filtering and sorting.
 */
const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: '',
    search: '',
  });

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll(filters);
      setLeads(response.data.data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeLead = async (id) => {
    try {
      await leadsAPI.analyze(id);
      loadLeads(); // Reload to show updated analysis
    } catch (error) {
      console.error('Error analyzing lead:', error);
    }
  };

  const getStageBadge = (stage) => {
    const colors = {
      Warm: 'badge-blue',
      Interested: 'badge-yellow',
      'Almost Onboarded': 'badge-green',
      Onboarded: 'badge-green',
      Rejected: 'badge-red',
    };
    return <span className={`badge ${colors[stage]}`}>{stage}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads</h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or niche..."
              className="input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="input"
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          >
            <option value="">All Stages</option>
            <option value="Warm">Warm</option>
            <option value="Interested">Interested</option>
            <option value="Almost Onboarded">Almost Onboarded</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Niche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fit Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.niche || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStageBadge(lead.stage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.fitScore !== null ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${lead.fitScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{lead.fitScore}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not analyzed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!lead.fitScore && (
                        <button
                          onClick={() => analyzeLead(lead.id)}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <SparklesIcon className="h-4 w-4 mr-1" />
                          Analyze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
