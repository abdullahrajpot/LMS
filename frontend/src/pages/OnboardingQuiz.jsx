import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Brain, Compass, Sparkles } from 'lucide-react';

const steps = [
  {
    id: 'interests',
    title: 'What topics excite you the most?',
    subtitle: 'We will use this to match you with the right courses.',
    multiple: true,
    options: [
      'Programming & Software',
      'Data Science & AI',
      'Business & Management',
      'Design & Creativity',
      'Personal Development',
      'Language & Communication'
    ],
  },
  {
    id: 'preferredDifficulty',
    title: 'How challenging should your courses be?',
    subtitle: 'We balance growth with comfort.',
    multiple: false,
    options: ['easy', 'medium', 'hard'],
    labels: {
      easy: 'Easy — I prefer gentle introductions',
      medium: 'Medium — Balanced challenge',
      hard: 'Hard — I enjoy intense challenges',
    },
  },
  {
    id: 'studyPace',
    title: 'What is your ideal study pace?',
    subtitle: 'We will shape your recommendations around your rhythm.',
    multiple: false,
    options: ['slow', 'balanced', 'fast'],
    labels: {
      slow: 'Slow — A few short sessions per week',
      balanced: 'Balanced — Regular but manageable',
      fast: 'Fast — I like to binge-learn',
    },
  },
];

const OnboardingQuiz = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    interests: [],
    preferredDifficulty: 'medium',
    studyPace: 'balanced',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'learner') {
    navigate('/dashboard');
  }

  const currentStep = steps[stepIndex];

  const toggleInterest = (value) => {
    setAnswers((prev) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((v) => v !== value)
          : [...prev.interests, value],
      };
    });
  };

  const handleSingleChoice = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError('');
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }

    // Final step – submit to backend
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/users/onboarding',
        {
          interests: answers.interests,
          preferredDifficulty: answers.preferredDifficulty,
          studyPace: answers.studyPace,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save your learning profile');
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div className="page-shell flex items-center justify-center py-10 px-4">
      <div className="glass-panel max-w-3xl w-full p-8 md:p-10 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-subtitle mb-1">Personalized Onboarding</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Brain className="text-primary-soft" /> Shape Your Learning Journey
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Answer a few quick questions so we can recommend courses that fit your interests and learning psychology.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center text-xs text-slate-400">
            <Sparkles className="mb-1 text-yellow-400" />
            <span>Step {stepIndex + 1} of {steps.length}</span>
          </div>
        </div>

        <div className="relative">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-soft to-primary"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-primary-soft flex items-center gap-2">
            <Compass className="w-4 h-4" /> Learner Profile
          </p>
          <h2 className="section-title">{currentStep.title}</h2>
          <p className="text-sm text-slate-300">{currentStep.subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {currentStep.id === 'interests' &&
            currentStep.options.map((opt) => {
              const selected = answers.interests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInterest(opt)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                    selected
                      ? 'border-primary-soft bg-primary-soft/10 text-slate-50'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-primary-soft/60 hover:bg-slate-900'
                  }`}
                >
                  {opt}
                </button>
              );
            })}

          {currentStep.id === 'preferredDifficulty' &&
            currentStep.options.map((opt) => {
              const label = currentStep.labels?.[opt] || opt;
              const selected = answers.preferredDifficulty === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSingleChoice('preferredDifficulty', opt)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                    selected
                      ? 'border-primary-soft bg-primary-soft/10 text-slate-50'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-primary-soft/60 hover:bg-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}

          {currentStep.id === 'studyPace' &&
            currentStep.options.map((opt) => {
              const label = currentStep.labels?.[opt] || opt;
              const selected = answers.studyPace === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSingleChoice('studyPace', opt)}
                  className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                    selected
                      ? 'border-primary-soft bg-primary-soft/10 text-slate-50'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-primary-soft/60 hover:bg-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
          <p className="text-xs text-slate-400 max-w-xs">
            Your responses are used only to improve recommendations. You can change preferences later from your profile.
          </p>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="btn btn-primary min-w-[150px]"
          >
            {loading ? 'Saving...' : isLastStep ? 'Finish & View Courses' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;

