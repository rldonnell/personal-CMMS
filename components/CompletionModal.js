export default function CompletionModal({
  isOpen,
  onClose,
  onSaveAndComplete,
  onSkip,
  notes,
  onNotesChange,
  cost,
  onCostChange,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Complete Task</h2>

        <div className="space-y-4 mb-6">
          {/* Notes textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes about this completion..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Cost input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => onCostChange(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSkip}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={onSaveAndComplete}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-fw-navy text-white rounded-lg text-sm font-medium hover:bg-fw-navy-light transition disabled:opacity-50"
          >
            {isLoading ? '...' : 'Save & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
