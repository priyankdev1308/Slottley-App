import { TOTAL_FITNESS_STEPS } from '../screens/FitnessInfoScreen';

type PostAuthRoute =
  | { name: 'MainTabs' }
  | { name: 'FitnessInfoScreen'; params: { startStep: number } };

// Decides where a signed-in user should land: straight into the app if
// onboarding is done, otherwise back into the fitness-info wizard at the
// first step they haven't completed yet.
export const getPostAuthRoute = (userData: any): PostAuthRoute => {
  const isOnboardingComplete =
    userData?.is_onboarding_completed === 1 ||
    userData?.is_onboarding_completed === true ||
    userData?.is_onboarding_completed === '1';

  if (isOnboardingComplete) {
    return { name: 'MainTabs' };
  }

  const completedSteps = Number(userData?.onboarding_completed_steps) || 0;
  const startStep = Math.min(completedSteps + 1, TOTAL_FITNESS_STEPS);
  return { name: 'FitnessInfoScreen', params: { startStep } };
};
