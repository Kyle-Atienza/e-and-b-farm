import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

type DatePickerButtonProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
};

export function DatePickerButton({
  selectedDate,
  onDateSelect,
}: DatePickerButtonProps) {
  const [month, setMonth] = useState(selectedDate);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button size="icon-sm" variant="outline" aria-label="Choose date">
            <HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            if (date) {
              onDateSelect(date);
              setIsOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
