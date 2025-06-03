import React from 'react';
import Button from '../common/Button';
import { 
  Archive, BellOff, Clock, Download, Tags, Users, Trash
} from 'lucide-react';

interface AlertActionsProps {
  selectedCount: number;
  onAcknowledge: () => void;
  onSuppress: () => void;
  onAssign: () => void;
  onAddTag: () => void;
  onExport: () => void;
  onDelete: () => void;
}

const AlertActions: React.FC<AlertActionsProps> = ({
  selectedCount,
  onAcknowledge,
  onSuppress,
  onAssign,
  onAddTag,
  onExport,
  onDelete,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 fixed bottom-0 left-0 right-0 z-10 shadow-lg animate-slide-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          {selectedCount} {selectedCount === 1 ? 'alert' : 'alerts'} selected
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Clock size={14} />}
            onClick={onAcknowledge}
          >
            Acknowledge
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BellOff size={14} />}
            onClick={onSuppress}
          >
            Suppress
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users size={14} />}
            onClick={onAssign}
          >
            Assign
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Tags size={14} />}
            onClick={onAddTag}
          >
            Add Tag
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={onExport}
          >
            Export
          </Button>
          <Button
            variant="error"
            size="sm"
            leftIcon={<Trash size={14} />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertActions;