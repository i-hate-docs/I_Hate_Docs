import { useAppStore } from '@/stores/appStore';
import { Workspace } from './Workspace';
import { Documents } from './Documents';
import { Agents } from './Agents';
import { Presentations } from './Presentations';
import { Redesign } from './Redesign';
import { Research } from './Research';
import { MultiDoc } from './MultiDoc';
import { Settings } from './Settings';

export default function Dashboard() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <div className="h-full overflow-hidden">
      {currentView === 'workspace' && <Workspace />}
      {currentView === 'documents' && <Documents />}
      {currentView === 'agents' && <Agents />}
      {currentView === 'presentation' && <Presentations />}
      {currentView === 'redesign' && <Redesign />}
      {currentView === 'research' && <Research />}
      {currentView === 'multi-doc' && <MultiDoc />}
      {(currentView === 'recent' || currentView === 'shared' || currentView === 'starred' || currentView === 'templates' || currentView === 'trash') && (
        <Documents filter={currentView} />
      )}
      {currentView === 'settings' && <Settings />}
    </div>
  );
}
