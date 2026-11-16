import { toast } from '@/components/ui/toast';

/**
 * Standardized Toast notifications for Demo Presentation Mode.
 */
export const demoToast = {
  launched() {
    toast.success('Welcome to Interactive Demo Mode!', {
      description: 'Loaded fictional persona Alex Morgan (Entry-level Backend SWE). Real user data is untouched.',
    });
  },

  reset() {
    toast.success('Demo State Reset', {
      description: 'Pristine demonstration baseline restored across all features.',
    });
  },

  simulated(actionName = 'Action') {
    toast.info(`${actionName} Simulated`, {
      description: 'Executed within isolated demo sandbox using precomputed fixtures.',
    });
  },

  exited() {
    toast.info('Exited Demo Presentation Mode', {
      description: 'Returned to standard application state.',
    });
  },
};
