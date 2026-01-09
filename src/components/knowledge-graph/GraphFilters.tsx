/**
 * GraphFilters - Filter controls for the knowledge graph
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import type { GraphFilters as FilterState } from './hooks/useGraphFilters';

interface Props {
  departments: string[];
  expertiseAreas: string[];
  value: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function GraphFilters({
  departments,
  expertiseAreas,
  value,
  onChange,
  onClear,
  hasActiveFilters,
}: Props) {
  const toggleDepartment = (dept: string) => {
    const current = value.departments;
    const updated = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept];
    onChange({ ...value, departments: updated });
  };

  const toggleExpertiseArea = (area: string) => {
    const current = value.expertiseAreas;
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    onChange({ ...value, expertiseAreas: updated });
  };

  const activeCount = value.departments.length + value.expertiseAreas.length;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <Badge className="ml-1 bg-coffee-mocha text-white text-xs px-1.5">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Departments */}
            {departments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-coffee-espresso mb-2">
                  Departments
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {departments.map(dept => (
                    <Badge
                      key={dept}
                      variant={value.departments.includes(dept) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        value.departments.includes(dept)
                          ? 'bg-coffee-mocha text-white hover:bg-coffee-espresso'
                          : 'hover:bg-coffee-cream'
                      }`}
                      onClick={() => toggleDepartment(dept)}
                    >
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise Areas */}
            {expertiseAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-coffee-espresso mb-2">
                  Expertise Areas
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {expertiseAreas.slice(0, 20).map(area => (
                    <Badge
                      key={area}
                      variant={value.expertiseAreas.includes(area) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        value.expertiseAreas.includes(area)
                          ? 'bg-coffee-mocha text-white hover:bg-coffee-espresso'
                          : 'hover:bg-coffee-cream'
                      }`}
                      onClick={() => toggleExpertiseArea(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                  {expertiseAreas.length > 20 && (
                    <span className="text-xs text-coffee-latte">
                      +{expertiseAreas.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {departments.length === 0 && expertiseAreas.length === 0 && (
              <p className="text-sm text-coffee-cortado text-center py-4">
                No filters available
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-coffee-cortado hover:text-coffee-espresso"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
