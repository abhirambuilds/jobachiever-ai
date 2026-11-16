import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoService } from '@/demo/demoService';
import { toast } from '@/components/ui/toast';

export function DemoResetButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  label = 'Reset Demo State',
}) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      demoService.resetDemoState();
      toast.success('Demo environment state successfully restored to initial baseline.');
    } catch {
      toast.error('Failed to reset demo state.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleReset}
      disabled={isResetting}
      className={`gap-1.5 ${className}`}
      title="Restore sample demo data to initial state"
    >
      <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
      <span>{label}</span>
    </Button>
  );
}
