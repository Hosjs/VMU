import { useState, useEffect, useRef } from 'react';

export interface AutocompleteOption {
  value: string | number;
  label: string;
  subtitle?: string;
  searchText?: string;
}

interface UseAutocompleteOptions {
  options: AutocompleteOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useAutocomplete({
  options,
  value,
  onChange,
  onOpen,
  onClose,
}: UseAutocompleteOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option - use String comparison to handle number/string type coercion
  // (API may return numeric IDs as strings while state stores numbers or vice versa)
  const selectedOption =
    value !== '' && value !== undefined && value !== null
      ? options.find((opt) => String(opt.value) === String(value))
      : undefined;

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.subtitle?.toLowerCase().includes(term) ||
        opt.searchText?.toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent when opening/closing
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen, onOpen, onClose]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value);
    handleClose();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return {
    // State
    isOpen,
    searchTerm,
    filteredOptions,
    selectedOption,

    // Refs
    containerRef,
    inputRef,

    // Actions
    handleOpen,
    handleClose,
    handleSelect,
    handleClear,
    handleSearchChange,
  };
}

