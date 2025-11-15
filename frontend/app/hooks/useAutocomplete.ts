import { useState, useEffect, useRef } from 'react';

export interface AutocompleteOption {
  value: string | number;
  label: string;
  subtitle?: string;
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

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

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
        opt.subtitle?.toLowerCase().includes(term)
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

