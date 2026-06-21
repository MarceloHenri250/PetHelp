import * as React from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { cn } from './utils';

type PasswordInputProps = React.ComponentProps<'input'>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        data-slot="password-input"
        className={cn(
          'w-full pl-12 pr-12 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground',
          className,
        )}
        {...props}
        type={visible ? 'text' : 'password'}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar senha' : 'Exibir senha'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
