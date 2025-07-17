'use client'
import React, { useState } from "react";
import InboxActivityLayout from "./InboxActivityLayout";
import OverviewStep from "./steps/OverviewStep";
import ScenarioStep from "./steps/ScenarioStep";
import AddCharactersStep from "./steps/AddCharactersStep";
import AddContentStep from "./steps/AddContentStep";
import PreviewStep from "./steps/PreviewStep";
import { useRouter } from 'next/navigation';

const initialFormData = {
  overview: "",
  exerciseTime: 0,
  readingTime: 0,
  name: "",
  description: "",
};

const initialScenario = {
  id: 1,
  title: '',
  content: '',
  exerciseTime: 0,
  readingTime: 0,
};

interface Character {
  name: string;
  email: string;
  designation: string;
}

const Page = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [scenarios, setScenarios] = useState([initialScenario]);
  const [currentScenario, setCurrentScenario] = useState(initialScenario);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScenarioSelect = (scenario: typeof initialScenario) => {
    setCurrentScenario(scenario);
  };

  const handleAddNewScenario = () => {
    const newScenario = {
      id: Date.now(),
      title: '',
      content: '',
      exerciseTime: 0,
      readingTime: 0,
    };
    setScenarios([...scenarios, newScenario]);
    setCurrentScenario(newScenario);
  };

  // Character logic
  const addCharacter = (character: Character) => {
    setCharacters((prev) => [...prev, character]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Prepare data for API
      const payload = {
        name: formData.name,
        description: formData.description,
        instructions: formData.overview,
        videoUrl: '', // Add videoUrl if you collect it
        scenarios: scenarios.map(s => ({
          title: s.title,
          readTime: s.readingTime,
          exerciseTime: s.exerciseTime,
          data: s.content,
        })),
        tasks: [], // Add tasks if you collect them in your flow
        characters: characters,
        organizationCharts: [], // Add org chart data if you collect it
        contents: [], // Add email content data if you collect it
      };
      const res = await fetch('/api/inbox-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZkNjkzMjMxMjYzYjNjMmQ4OTJiYTEiLCJpYXQiOjE3NTIwODM4OTksImV4cCI6MTc1MjY4ODY5OX0.tTGDyJJ-rjo_tKQ89qKHhxcxd3G4YVn4M_qrfdqwg_0',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create inbox activity');
      router.push('/dashboard/report-generation/content/assessment');
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const stepContents = [
    <OverviewStep key="overview" formData={formData} updateFormData={updateFormData} />,
    <ScenarioStep key="scenario"
      scenarios={scenarios}
      currentScenario={currentScenario}
      setCurrentScenario={setCurrentScenario}
      onScenarioSelect={handleScenarioSelect}
      onAddNew={handleAddNewScenario}
    />,
    <AddCharactersStep key="characters" characters={characters} addCharacter={addCharacter} />,
    <AddContentStep key="content" />,
    <PreviewStep key="preview"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />,
  ];

  const getSaveButtonText = () => {
    if (currentStep === stepContents.length - 2) {
      return "Next";
    }
    return "Save and Next";
  };

  const handleSave = () => {
    if (currentStep < stepContents.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <InboxActivityLayout
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      showSaveButton={currentStep < stepContents.length - 1}
      saveButtonText={getSaveButtonText()}
    >
      {stepContents[currentStep]}
    </InboxActivityLayout>
  );
};

export default Page;











