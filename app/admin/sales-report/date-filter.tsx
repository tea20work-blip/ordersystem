"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateFilter({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const router = useRouter();
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });

  const handleApply = () => {
    const params = new URLSearchParams();
    if (date?.from) {
      params.set("startDate", format(date.from, "yyyy-MM-dd"));
    }
    if (date?.to) {
      params.set("endDate", format(date.to, "yyyy-MM-dd"));
    }
    router.push(`/admin/sales-report?${params.toString()}`);
  };

  const handleClear = () => {
    setDate(undefined);
    router.push("/admin/sales-report");
  };

  return (
    <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</label>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Button onClick={handleApply} className="bg-gray-900 text-white hover:bg-gray-800 transition-colors">
        Filter
      </Button>
      {(startDate || endDate) && (
        <Button variant="outline" onClick={handleClear} className="transition-colors">
          Clear
        </Button>
      )}
    </div>
  );
}
