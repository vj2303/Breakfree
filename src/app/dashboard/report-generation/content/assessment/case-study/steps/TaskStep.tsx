'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Editor from '@/components/Editor';
import { Task } from '../page';

interface TaskStepProps {
  tasks: Task[];
  currentTask: Task;
  setCurrentTask: (task: Task) => void;
  onTaskSelect: (task: Task) => void;
  onAddNew: () => void;
}

const TaskStep: React.FC<TaskStepProps> = ({
  tasks,
  currentTask,
  setCurrentTask,
  onTaskSelect,
  onAddNew
}) => {
  const updateCurrentTask = (field: keyof Task, value: string | boolean | number) => {
    setCurrentTask({
      ...currentTask,
      [field]: value
    });
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Task</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-black">Exercise Time (Min)</span>
              <input 
                type="number" 
                value={currentTask.exerciseTime}
                onChange={(e) => updateCurrentTask('exerciseTime', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black">Reading Time (Min)</span>
              <input 
                type="number" 
                value={currentTask.readingTime}
                onChange={(e) => updateCurrentTask('readingTime', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-black"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-black">Title</label>
          <input 
            type="text" 
            value={currentTask.title}
            onChange={(e) => updateCurrentTask('title', e.target.value)}
            placeholder="Card Sorting"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>

        <Editor
          content={currentTask.content}
          onChange={(value) => updateCurrentTask('content', value)}
        />

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 text-black">Response Document</h3>
          <select 
            value={currentTask.responseType}
            onChange={(e) => updateCurrentTask('responseType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">Select Type</option>
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
          <div className="mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={currentTask.isMandatory}
                onChange={(e) => updateCurrentTask('isMandatory', e.target.checked)}
              />
              <span className="text-black">Mark as mandatory field</span>
            </label>
          </div>
        </div>
      </div>

      <div className="w-80">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-black">All Tasks</h3>
            <button 
              onClick={onAddNew}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Task
            </button>
          </div>
          
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`p-3 rounded border-l-4 cursor-pointer transition-colors ${
                  currentTask.id === task.id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onTaskSelect(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-black">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Exercise: {task.exerciseTime}min | Reading: {task.readingTime}min
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.responseType && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black">
                          {task.responseType}
                        </span>
                      )}
                      {task.isMandatory && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskSelect(task);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks created yet</p>
                <button 
                  onClick={onAddNew}
                  className="text-blue-600 text-sm hover:underline mt-2"
                >
                  Create your first task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStep;