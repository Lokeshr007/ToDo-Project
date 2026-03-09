import React, { useState, useCallback } from 'react';
import { 
  FileText, Upload, Sparkles, X, 
  CheckCircle2, Loader2, ListPlus, 
  Search, ClipboardCheck, ArrowRight,
  RefreshCw, Check, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

const AITaskGenerator = ({ workspaceId, onTasksGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Success
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [parsedPlan, setParsedPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false 
  });

  const handleParse = async () => {
    if (!file) {
      taskToast.error('Please select a file first');
      return;
    }
    setParsing(true);
    const formData = new FormData();
    formData.append('file', file);
    if (workspaceId) formData.append('workspaceId', workspaceId);

    try {
      const response = await API.post('/ai/parse-plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Corrected: Extract both ID and plan DTO
      setPlanId(response.data.id);
      setParsedPlan(response.data.plan || response.data);
      setStep(2);
      taskToast.success('Plan analyzed successfully');
    } catch (err) {
      console.error(err);
      taskToast.error('AI analysis failed');
    } finally {
      setParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (!planId) {
      taskToast.error('Missing plan reference. Please re-upload.');
      return;
    }
    setGenerating(true);
    try {
      const response = await API.post('/ai/generate-tasks', {
        planId: planId, // Correctly send ID
        workspaceId,
        createProject: true
      });
      setGeneratedTasks(response.data.tasks || []);
      setStep(3);
      taskToast.success(`Successfully created ${response.data.tasks?.length || 0} tasks`);
    } catch (err) {
      console.error(err);
      taskToast.error('Task generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async () => {
    setIsOpen(false);
    if (onTasksGenerated) onTasksGenerated();
    taskToast.success('Schedule implemented in workspace');
    reset();
  };

  const reset = () => {
    setFile(null);
    setPlanId(null);
    setParsedPlan(null);
    setGeneratedTasks([]);
    setStep(1);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all text-sm font-semibold shadow-md active:scale-95"
      >
        <Sparkles size={16} />
        AI Blueprint Assistant
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col z-[10002]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <ClipboardList size={22} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI Blueprint Assistant</h2>
                    <p className="text-xs text-slate-500 font-medium">Convert documents into project tasks</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Progress Stepper */}
              <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-950/20 flex items-center gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step >= i ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {step > i ? <Check size={14} /> : i}
                    </div>
                    {i < 3 && <div className={`w-8 h-px ${step > i ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`} />}
                  </div>
                ))}
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div 
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                          isDragActive 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' 
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {file ? <CheckCircle2 size={28} /> : <Upload size={28} />}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {file ? file.name : "Drop your project plan or curriculum here"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">
                          PDF, Word, or Text (Max 10MB)
                        </p>
                      </div>

                      <button
                        onClick={handleParse}
                        disabled={!file || parsing}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        {parsing ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                        {parsing ? "Parsing Document..." : "Analyze and Extract"}
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Extracted Roadmap Preview</label>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar leading-relaxed">
                          {typeof parsedPlan === 'string' ? parsedPlan : JSON.stringify(parsedPlan, null, 2)}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setStep(1)}
                          className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleGenerate}
                          disabled={generating}
                          className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                          {generating ? <Loader2 className="animate-spin" size={18} /> : <ListPlus size={18} />}
                          {generating ? "Creating Tasks..." : "Generate Roadmap"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tasks Created</h3>
                        <p className="text-sm text-slate-500 mt-1">Found and generated {generatedTasks.length} action items.</p>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {generatedTasks.map((task, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 w-5">{idx + 1}.</span>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{task.title || task.item}</h4>
                              {task.description && <p className="text-[10px] text-slate-500 truncate">{task.description}</p>}
                            </div>
                            <ArrowRight size={12} className="text-slate-300" />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={reset}
                          className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleAccept}
                          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                          Confirm & Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITaskGenerator;
