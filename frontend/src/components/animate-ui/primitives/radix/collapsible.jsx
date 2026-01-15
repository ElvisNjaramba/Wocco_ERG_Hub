'use client';;
import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion } from 'motion/react';

import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

const [CollapsibleProvider, useCollapsible] =
  getStrictContext('CollapsibleContext');

function Collapsible(props) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <CollapsibleProvider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} onOpenChange={setIsOpen} />
    </CollapsibleProvider>
  );
}

function CollapsibleTrigger(props) {
  return (<CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />);
}

function CollapsibleContent({
  keepRendered = false,
  transition = { duration: 0.35, ease: 'easeInOut' },
  ...props
}) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <CollapsiblePrimitive.Content asChild forceMount>
          <motion.div
            key="collapsible-content"
            data-slot="collapsible-content"
            layout
            initial={{ opacity: 0, height: 0, overflow: 'hidden', y: 20 }}
            animate={
              isOpen
                ? { opacity: 1, height: 'auto', overflow: 'hidden', y: 0 }
                : { opacity: 0, height: 0, overflow: 'hidden', y: 20 }
            }
            transition={transition}
            {...props} />
        </CollapsiblePrimitive.Content>
      ) : (
        isOpen && (
          <CollapsiblePrimitive.Content asChild forceMount>
            <motion.div
              key="collapsible-content"
              data-slot="collapsible-content"
              layout
              initial={{ opacity: 0, height: 0, overflow: 'hidden', y: 20 }}
              animate={{ opacity: 1, height: 'auto', overflow: 'hidden', y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden', y: 20 }}
              transition={transition}
              {...props} />
          </CollapsiblePrimitive.Content>
        )
      )}
    </AnimatePresence>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, useCollapsible };
