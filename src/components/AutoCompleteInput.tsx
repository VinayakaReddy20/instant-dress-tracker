import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { initializeGoogleMaps } from '@/lib/googleMaps';

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'country' | 'state' | 'city' | 'street';
  className?: string;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  type,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAutocompleteSuggestions = async (input: string): Promise<string[]> => {
    if (!input.trim()) return [];

    try {
      console.log('Initializing Google Maps...');
      const maps = await initializeGoogleMaps();
      console.log('Google Maps initialized successfully');

      const service = new maps.places.AutocompleteService();
      console.log('AutocompleteService created');

      return new Promise((resolve) => {
        const request = {
          input: input,
          types: getTypesForField(type),
          componentRestrictions: { country: 'in' }, // Restrict to India for now
        };

        console.log('Making autocomplete request:', request);

        service.getPlacePredictions(request, (predictions, status) => {
          console.log('Autocomplete response status:', status);
          console.log('Autocomplete predictions:', predictions);

          if (status === maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => prediction.description);
            console.log('Processed suggestions:', suggestions);
            resolve(suggestions);
          } else {
            console.log('No predictions or error status');
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  };

  const getTypesForField = (fieldType: string): string[] => {
    switch (fieldType) {
      case 'country':
        return ['country'];
      case 'state':
        return ['administrative_area_level_1'];
      case 'city':
        return ['locality', 'administrative_area_level_3'];
      case 'street':
        return ['address'];
      default:
        return [];
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 2) {
      const newSuggestions = await getAutocompleteSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          setInputValue(selectedSuggestion);
          onChange(selectedSuggestion);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
