import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  XMarkIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

/**
 * Document Viewer Modal
 *
 * Full-screen modal for viewing document content with markdown rendering.
 * Includes actions for approval, revision requests, and downloads.
 */
const DocumentViewer = ({ document, onClose, onApprove, onRequestRevision }) => {
  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  if (!document) return null;

  const handleRevisionSubmit = () => {
    if (revisionNotes.trim()) {
      onRequestRevision(revisionNotes);
      setRevisionNotes('');
      setRevisionMode(false);
    } else {
      alert('Please enter revision notes');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([document.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.fileName || document.name.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isApproved = document.status === 'approved';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{document.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {document.generatedAt && (
                <>Generated {new Date(document.generatedAt).toLocaleDateString()} &bull; </>
              )}
              Version {document.version || 1}
              {document.provider && <> &bull; {document.provider}</>}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3 mr-4">
            <StatusBadge status={document.status} />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {revisionMode ? (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Request Revision</h3>
              <p className="text-gray-600 mb-4">
                Please provide specific feedback on what needs to be improved or changed in this document.
              </p>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Enter your revision notes here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                autoFocus
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleRevisionSubmit}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Submit Revision Request
                </button>
                <button
                  onClick={() => {
                    setRevisionMode(false);
                    setRevisionNotes('');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-700" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-300" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => <th className="px-4 py-2 bg-gray-100 font-semibold text-left" {...props} />,
                  td: ({ node, ...props }) => <td className="px-4 py-2 border-t" {...props} />,
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props} />
                    ),
                }}
              >
                {document.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!revisionMode && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Download Markdown</span>
              </button>
            </div>

            <div className="flex space-x-3">
              {!isApproved && (
                <>
                  <button
                    onClick={() => setRevisionMode(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium transition-colors"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    onClick={onApprove}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Approve Document</span>
                  </button>
                </>
              )}

              {isApproved && (
                <div className="flex items-center space-x-2 text-green-700 font-medium">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Document Approved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    generated: { label: 'Generated', color: 'bg-blue-100 text-blue-800' },
    sent: { label: 'Sent', color: 'bg-purple-100 text-purple-800' },
    viewed: { label: 'Viewed', color: 'bg-indigo-100 text-indigo-800' },
    'revision-requested': { label: 'Revision Requested', color: 'bg-orange-100 text-orange-800' },
    approved: { label: 'Approved ✓', color: 'bg-green-100 text-green-800' },
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>;
};

export default DocumentViewer;
