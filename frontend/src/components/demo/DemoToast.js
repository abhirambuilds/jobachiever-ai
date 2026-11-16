import { toast } from '@/components/ui/toast';

/**
 * Clean, production-grade Toast notifications for JobAchiever AI.
 */
export const demoToast = {
  launched() {
    toast.success('Welcome back, Aarav!', {
      description: 'Your Career Command Center is up to date.',
    });
  },

  reset() {
    toast.success('Workspace Synced', {
      description: 'Workspace restored to default state.',
    });
  },

  simulated(actionName = 'Action') {
    toast.success(`${actionName} completed successfully.`);
  },

  exited() {
    toast.info('Signed out successfully.');
  },
};
