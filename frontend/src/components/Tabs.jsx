import * as React from "react";

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsContents as TabsContentsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
} from "@/components/animate-ui/primitives/radix/tabs";

import { cn } from "@/lib/utils";

/* ---------------- Tabs ---------------- */

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/* ---------------- TabsList ---------------- */

function TabsList({ className, ...props }) {
  return (
    <TabsHighlightPrimitive className="absolute inset-0 z-0 rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
      <TabsListPrimitive
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
          className
        )}
        {...props}
      />
    </TabsHighlightPrimitive>
  );
}

/* ---------------- TabsTrigger ---------------- */

function TabsTrigger({ className, ...props }) {
  return (
    <TabsHighlightItemPrimitive value={props.value} className="flex-1">
      <TabsTriggerPrimitive
        className={cn(
          "data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-muted-foreground inline-flex h-[calc(100%-1px)] w-full flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-500 ease-in-out focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
    </TabsHighlightItemPrimitive>
  );
}

/* ---------------- TabsContents ---------------- */

function TabsContents(props) {
  return <TabsContentsPrimitive {...props} />;
}

/* ---------------- TabsContent ---------------- */

function TabsContent({ className, ...props }) {
  return (
    <TabsContentPrimitive
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
};
