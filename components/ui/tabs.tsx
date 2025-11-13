import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "@/components/ui/Spinner";

import { cn } from "@/lib/utils";
import { Info, ShieldQuestion } from "lucide-react";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const GenericDetailsTab = ({
  value,
  title,
  description,
  detailsMap,
  aliases = {},
  isLoading,
  help,
}: {
  value: string;
  title: string;
  description: string;
  detailsMap: Record<string, string | number | string[]>;
  aliases?: Record<string, string>;
  isLoading: boolean;
  help?: string;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <TabsContent value={value} className="space-y-4 pt-4">
      <Card className="min-h-[400px]">
        <CardHeader className="bg-gray-100 mb-2">
          <div className="flex flex-row justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>{title}</CardTitle>

            </div>
            {help && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Help"
              >
                <Info className="w-5   h-5 cursor-pointer" />
              </button>
            )}
          </div>
          <CardDescription>{description}</CardDescription>

        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(detailsMap).map(([key, value]) => (
                <div key={key}>
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">
                    {(aliases[key]) || key.toUpperCase()}
                  </h3>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item) => (
                        <span
                          key={item}
                          className="bg-muted px-2 py-1 rounded text-xs text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {help && isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Help</h2>
            <p className="text-sm text-muted-foreground">{help}</p>
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-muted text-sm rounded hover:bg-black hover:text-white focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </Card>

      
    </TabsContent>
  );
};
export { Tabs, TabsList, TabsTrigger, TabsContent, GenericDetailsTab };
