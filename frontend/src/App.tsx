import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WorkflowBar } from './components/WorkflowBar';
import { Dashboard } from './pages/Dashboard';
import { ProjectOverview } from './pages/ProjectOverview';
import { Task1TargetId } from './pages/Task1TargetId';
import { Task2HostDiscovery } from './pages/Task2HostDiscovery';
import { Task3AttackSurface } from './pages/Task3AttackSurface';
import { Task4ServiceEnum } from './pages/Task4ServiceEnum';
import { Task5FTPAssessment } from './pages/Task5FTPAssessment';
import { Task6Strategy } from './pages/Task6Strategy';
import { Task7UnknownService } from './pages/Task7UnknownService';
import { Task8FinalAssessment } from './pages/Task8FinalAssessment';
import { EvidenceManager } from './pages/EvidenceManager';
import { FinalReport } from './pages/FinalReport';
import { SettingsMarking } from './pages/SettingsMarking';
import { api } from './services/api';

export function App() {
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProjectData = async () => {
    try {
      const res = await api.getProject();
      setProjectData(res);
    } catch (e) {
      console.error('Failed to load project metadata', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentSection}
            projectData={projectData}
            onRefresh={fetchProjectData}
          />
        );
      case 'overview':
        return (
          <ProjectOverview
            projectData={projectData}
            onRefresh={fetchProjectData}
          />
        );
      case 'task1':
        return (
          <Task1TargetId
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task2':
        return (
          <Task2HostDiscovery
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task3':
        return (
          <Task3AttackSurface
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task4':
        return (
          <Task4ServiceEnum
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task5':
        return (
          <Task5FTPAssessment
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task6':
        return (
          <Task6Strategy
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task7':
        return (
          <Task7UnknownService
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'task8':
        return (
          <Task8FinalAssessment
            onRefresh={fetchProjectData}
            onNavigate={setCurrentSection}
          />
        );
      case 'evidence':
        return <EvidenceManager onRefresh={fetchProjectData} />;
      case 'report':
        return (
          <FinalReport
            projectData={projectData}
            onRefresh={fetchProjectData}
          />
        );
      case 'settings':
        return <SettingsMarking onRefresh={fetchProjectData} />;
      default:
        return (
          <Dashboard
            onNavigate={setCurrentSection}
            projectData={projectData}
            onRefresh={fetchProjectData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col font-sans text-slate-100">
      <Header projectData={projectData} currentSection={currentSection} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          tasksStatus={projectData?.tasks_status}
        />

        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
          {/* Always display integrated workflow pipeline banner */}
          <WorkflowBar
            tasksStatus={projectData?.tasks_status}
            onNavigate={setCurrentSection}
          />

          {loading ? (
            <div className="flex items-center justify-center p-16 text-cyan-400 font-mono text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping mr-2" />
              Initializing Rabbit Security Assessment Platform...
            </div>
          ) : (
            renderSection()
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

