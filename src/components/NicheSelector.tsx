"use client";

import { cn } from "@/lib/utils";
import { NICHES, type NicheOption } from "@/types";
import { Check } from "lucide-react";

/**
 * NicheSelector supports BOTH single-select (legacy `selected` + `onChange`)
 * and multi-select (`selectedMany` + `onChangeMany`). The leads page uses the
 * multi variant; older pages keep working with the single variant.
 */
interface NicheSelectorProps {
  selected?: string;
  onChange?: (nicheId: string) => void;
  selectedMany?: string[];
  onChangeMany?: (next: string[]) => void;
  className?: string;
  max?: number;
}

export default function NicheSelector(props: NicheSelectorProps) {
  const isMulti = Array.isArray(props.selectedMany) && typeof props.onChangeMany === "function";

  const handleToggle = (nicheId: string) => {
    if (isMulti) {
      const cur = props.selectedMany ?? [];
      const next = cur.includes(nicheId)
        ? cur.filter(id => id !== nicheId)
        : (props.max && cur.length >= props.max ? cur : [...cur, nicheId]);
      props.onChangeMany?.(next);
    } else {
      props.onChange?.(nicheId);
    }
  };

  return (
    <div
      className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3", props.className)}
      role={isMulti ? "group" : "radiogroup"}
      aria-label="Select your niche"
    >
      {NICHES.map((niche: NicheOption) => {
        const isSelected = isMulti
          ? (props.selectedMany ?? []).includes(niche.id)
          : props.selected === niche.id;

        return (
          <button
            key={niche.id}
            type="button"
            role={isMulti ? "checkbox" : "radio"}
            aria-checked={isSelected}
            onClick={() => handleToggle(niche.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 group",
              isSelected
                ? "bg-primary/15 border-primary/50 text-foreground shadow-glow-primary/30"
                : "bg-surface border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-2xl" aria-hidden="true">{niche.icon}</span>
            <div>
              <div className={cn("text-xs font-semibold leading-tight", isSelected ? "text-primary-light" : "text-foreground")}>
                {niche.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{niche.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
