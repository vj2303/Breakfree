'use client';

import React, { useState, useEffect } from 'react';
import CaseStudyLayout from './CaseStudyLayout';
import OverviewStep from './steps/OverviewStep';
import ScenarioStep from './steps/ScenarioStep';
import TaskStep from './steps/TaskStep';
import PreviewStep from './steps/PreviewStep';
import { createCaseStudy, fetchCaseStudyById, updateCaseStudy } from '@/lib/caseStudyApi';
import { useRouter, useSearchParams } from 'next/navigation';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  content: string;
  exerciseTime: number;
  readingTime: number;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  responseType: string;
  isMandatory: boolean;
  exerciseTime: number;
  readingTime: number;
}

const CaseStudyAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    overview: '',
    exerciseTime: 30,
    readingTime: 30,
    name: '',
    description: '',
    videoUrl: '',
  });
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    id: '',
    title: '',
    description: '',
    content: '',
    exerciseTime: 30,
    readingTime: 30
  });
  const [currentTask, setCurrentTask] = useState<Task>({
    id: '',
    title: '',
    content: '',
    responseType: '',
    isMandatory: false,
    exerciseTime: 30,
    readingTime: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [prefilledId, setPrefilledId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    // Pre-fill from localStorage if available (for new)
    if (!id && typeof window !== 'undefined') {
      const draft = localStorage.getItem('caseStudyDraft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(prev => ({
            ...prev,
            name: parsed.name || '',
            description: parsed.description || '',
          }));
        } catch {}
        localStorage.removeItem('caseStudyDraft');
      }
    }
  }, [id]);

  useEffect(() => {
    // If editing, fetch and prefill
    if (id && prefilledId !== id) {
      setLoading(true);
      fetchCaseStudyById(id)
        .then((data) => {
          setFormData({
            overview: data.instructions || '',
            exerciseTime: 30,
            readingTime: 30,
            name: data.name || '',
            description: data.description || '',
            videoUrl: data.videoUrl || '',
          });
          setScenarios(
            (data.scenarios || []).map((s: any) => ({
              id: s.id || '',
              title: s.title || '',
              description: s.description || '',
              content: s.data || '',
              exerciseTime: s.exerciseTime || 30,
              readingTime: s.readTime || 30,
            }))
          );
          // Prefill currentScenario with the first scenario if available
          const loadedScenarios = (data.scenarios || []).map((s: any) => ({
            id: s.id || '',
            title: s.title || '',
            description: s.description || '',
            content: s.data || '',
            exerciseTime: s.exerciseTime || 30,
            readingTime: s.readTime || 30,
          }));
          setScenarios(loadedScenarios);
          if (loadedScenarios.length > 0) {
            setCurrentScenario(loadedScenarios[0]);
          }

          setTasks(
            (data.tasks || []).map((t: any) => ({
              id: t.id || '',
              title: t.title || '',
              content: t.data || '',
              responseType: t.responseType || '',
              isMandatory: t.isMandatory || false,
              exerciseTime: t.exerciseTime || 30,
              readingTime: t.readTime || 30,
            }))
          );
          // Prefill currentTask with the first task if available
          const loadedTasks = (data.tasks || []).map((t: any) => ({
            id: t.id || '',
            title: t.title || '',
            content: t.data || '',
            responseType: t.responseType || '',
            isMandatory: t.isMandatory || false,
            exerciseTime: t.exerciseTime || 30,
            readingTime: t.readTime || 30,
          }));
          setTasks(loadedTasks);
          if (loadedTasks.length > 0) {
            setCurrentTask(loadedTasks[0]);
          }
          setPrefilledId(id);
        })
        .catch((err) => {
          setError('Failed to load case study for editing');
        })
        .finally(() => setLoading(false));
    }
  }, [id, prefilledId]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleSave = async () => {
    if (currentStep === 1) {
      // Save scenario
      if (currentScenario.title && currentScenario.content) {
        const scenarioToSave = {
          ...currentScenario,
          id: currentScenario.id || Date.now().toString(),
          description: currentScenario.description || '',
        };
        
        if (currentScenario.id) {
          setScenarios(prev => prev.map(s => s.id === currentScenario.id ? scenarioToSave : s));
        } else {
          setScenarios(prev => [...prev, scenarioToSave]);
        }
        
        setCurrentScenario({
          id: '',
          title: '',
          description: '',
          content: '',
          exerciseTime: 30,
          readingTime: 30
        });
      }
    } else if (currentStep === 2) {
      // Save task
      if (currentTask.title && currentTask.content) {
        const taskToSave = {
          ...currentTask,
          id: currentTask.id || Date.now().toString()
        };
        
        if (currentTask.id) {
          setTasks(prev => prev.map(t => t.id === currentTask.id ? taskToSave : t));
        } else {
          setTasks(prev => [...prev, taskToSave]);
        }
        
        setCurrentTask({
          id: '',
          title: '',
          content: '',
          responseType: '',
          isMandatory: false,
          exerciseTime: 30,
          readingTime: 30
        });
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final save logic: call API
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const payload = {
          name: formData.name || '',
          description: formData.description || '',
          instructions: formData.overview || '',
          videoUrl: formData.videoUrl || '',
          scenarios: scenarios.map(s => ({
            title: s.title || '',
            readTime: s.readingTime || '',
            exerciseTime: s.exerciseTime || '',
            data: s.content || ''
          })),
          tasks: tasks.map(t => ({
            title: t.title || '',
            readTime: t.readingTime || '',
            exerciseTime: t.exerciseTime || '',
            data: t.content || ''
          }))
        };
        if (id) {
          await updateCaseStudy(id, payload);
        } else {
          await createCaseStudy(payload);
        }
        router.push('/dashboard/report-generation/content/assessment');
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
          setError((err as Error).message);
        } else {
          setError('Failed to save case study');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    console.log('Cancelled');
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setCurrentScenario(scenario);
  };

  const handleTaskSelect = (task: Task) => {
    setCurrentTask(task);
  };

  const handleAddNewScenario = () => {
    setCurrentScenario({
      id: '',
      title: '',
      description: '',
      content: '',
      exerciseTime: 30,
      readingTime: 30
    });
  };

  const handleAddNewTask = () => {
    setCurrentTask({
      id: '',
      title: '',
      content: '',
      responseType: '',
      isMandatory: false,
      exerciseTime: 30,
      readingTime: 30
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OverviewStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );

      case 1:
        return (
          <ScenarioStep
            scenarios={scenarios}
            currentScenario={currentScenario}
            setCurrentScenario={setCurrentScenario}
            onScenarioSelect={handleScenarioSelect}
            onAddNew={handleAddNewScenario}
          />
        );

      case 2:
        return (
          <TaskStep
            tasks={tasks}
            currentTask={currentTask}
            setCurrentTask={setCurrentTask}
            onTaskSelect={handleTaskSelect}
            onAddNew={handleAddNewTask}
          />
        );

      case 3:
        return (
          <PreviewStep
            formData={formData}
            scenarios={scenarios}
            tasks={tasks}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">Saving assessment, please wait...</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">Assessment saved successfully!</div>
      )}
      <CaseStudyLayout
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSave={handleSave}
        onCancel={handleCancel}
        showCancelButton={currentStep === 0}
        saveButtonText={currentStep === 3 ? (id ? "Update Assessment" : "Save Assessment") : "Save and Next"}
      >
        {renderStepContent()}
      </CaseStudyLayout>
    </>
  );
};

export default CaseStudyAssessment;