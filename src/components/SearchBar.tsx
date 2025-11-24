import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Store, Shirt, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabaseClient';
import { searchSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  showButton?: boolean;
}

interface SuggestionItem {
  id: string;
  text: string;
  type: 'shop' | 'dress';
  category?: string;
  searchQuery?: string;
}

interface GroupedSuggestions {
  shops: SuggestionItem[];
  dresses: SuggestionItem[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, showButton = true }) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) return urlQuery;
    return localStorage.getItem('lastSearchQuery') || '';
  });
  const [suggestions, setSuggestions] = useState<GroupedSuggestions>({ shops: [], dresses: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch data for suggestions
  const [searchData, setSearchData] = useState<SuggestionItem[]>([]);

  // Update query when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);

  // Persist query to localStorage
  useEffect(() => {
    localStorage.setItem('lastSearchQuery', query);
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopsRes, dressesRes] = await Promise.all([
          supabase.from('shops').select('id, name, business_name, specialties, location'),
          supabase.from('dresses').select('id, name, brand, category, color, material, shops(name)')
        ]);

        const shopItems: SuggestionItem[] = [];
        shopsRes.data?.forEach(shop => {
          shopItems.push({
            id: shop.id,
            text: shop.name,
            type: 'shop',
            category: 'Shop Name'
          });
          if (shop.business_name) {
            shopItems.push({
              id: shop.id,
              text: shop.business_name,
              type: 'shop',
              category: 'Business Name'
            });
          }
          if (shop.specialties) {
            shop.specialties.forEach(specialty => {
              shopItems.push({
                id: shop.id,
                text: specialty,
                type: 'shop',
                category: 'Specialty'
              });
            });
          }
          if (shop.location) {
            shopItems.push({
              id: shop.id,
              text: shop.location,
              type: 'shop',
              category: 'Location'
            });
          }
        });

        const dressItems: SuggestionItem[] = [];
        dressesRes.data?.forEach(dress => {
          dressItems.push({
            id: dress.id,
            text: dress.shops?.name ? `${dress.name} - ${dress.shops.name}` : dress.name,
            type: 'dress',
            category: 'Dress Name',
            searchQuery: dress.name
          });
          if (dress.brand) {
            dressItems.push({
              id: dress.id,
              text: dress.brand,
              type: 'dress',
              category: 'Brand',
              searchQuery: dress.brand
            });
          }
          if (dress.category) {
            dressItems.push({
              id: dress.id,
              text: dress.category,
              type: 'dress',
              category: 'Category',
              searchQuery: dress.category
            });
          }
          if (dress.color) {
            dressItems.push({
              id: dress.id,
              text: dress.color,
              type: 'dress',
              category: 'Color',
              searchQuery: dress.color
            });
          }
          if (dress.material) {
            dressItems.push({
              id: dress.id,
              text: dress.material,
              type: 'dress',
              category: 'Material',
              searchQuery: dress.material
            });
          }
        });

        setSearchData([...shopItems, ...dressItems]);
      } catch (err) {
        console.error('Error fetching search data:', err);
      }
    };

    fetchData();
  }, []);

  // Fuse.js options
  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: ['text'],
      threshold: 0.4, // Allow some fuzziness
      includeScore: true,
      includeMatches: true
    });
  }, [searchData]);

  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions({ shops: [], dresses: [] });
      setShowSuggestions(false);
      setError('');
      return;
    }

    // No validation for suggestions since input is sanitized
    setError('');

    const results = fuse.search(searchQuery);

    // Rank: exact matches first, then partial
    const ranked = results
      .sort((a, b) => {
        const aScore = a.score || 0;
        const bScore = b.score || 0;
        // Lower score is better match
        if (aScore !== bScore) return aScore - bScore;

        // If same score, prefer exact matches
        const aExact = a.item.text.toLowerCase() === searchQuery.toLowerCase();
        const bExact = b.item.text.toLowerCase() === searchQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return 0;
      })
      .map(result => result.item);

    // Group by type
    const shops = ranked.filter(item => item.type === 'shop').slice(0, 5);
    const dresses = ranked.filter(item => item.type === 'dress').slice(0, 5);

    const grouped = { shops, dresses };
    setSuggestions(grouped);
    setShowSuggestions(shops.length > 0 || dresses.length > 0);
    setSelectedIndex(-1);
  }, [fuse]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Sanitize: remove invalid characters, trim leading/trailing spaces, limit to 50 chars
    value = value.replace(/[^A-Za-z0-9 ,-]/g, '').trim().substring(0, 50);
    setQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const totalSuggestions = suggestions.shops.length + suggestions.dresses.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalSuggestions - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalSuggestions) {
          const allSuggestions = [...suggestions.shops, ...suggestions.dresses];
          handleSuggestionSelect(allSuggestions[selectedIndex]);
        } else {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    const searchText = suggestion.searchQuery || suggestion.text;
    setQuery(searchText);
    localStorage.setItem('lastSearchQuery', searchText);
    onSearch(searchText);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Validate before submission
      const validation = searchSchema.safeParse({ query: query });
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        return;
      }
      localStorage.setItem('lastSearchQuery', query);
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  // Click outside to close
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

  const noResultsMessage = query.length >= 2 && !showSuggestions && !error
    ? "No dresses or shops found. Try searching 'red dress', 'party wear', or 'Trends shop'."
    : '';

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative flex">
        <div className={`relative ${showButton ? 'flex-1' : 'w-full'}`}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search dresses, shops, styles..."
            className={`pl-12 pr-10 py-3 w-full h-12 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white ${showButton ? '' : 'rounded-r-xl'}`}
            autoComplete="off"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showButton && (
          <Button
            type="submit"
            className="ml-2 px-6 py-3 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Search
          </Button>
        )}
      </form>

      {error && (
        <div className="absolute z-50 mt-2 w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm shadow-md">
          {error}
        </div>
      )}

      {noResultsMessage && (
        <div className="absolute z-50 mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 text-sm shadow-md">
          {noResultsMessage}
        </div>
      )}

      {showSuggestions && (suggestions.shops.length > 0 || suggestions.dresses.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto transition-all duration-200 ease-in-out"
        >
          {suggestions.shops.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Shops</div>
              {suggestions.shops.map((suggestion, index) => (
                <div
                  key={`shop-${suggestion.id}-${suggestion.category}`}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center transition-colors duration-150 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <Store className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="flex-1">{suggestion.text}</span>
                  <span className="text-xs text-gray-500 ml-2">{suggestion.category}</span>
                </div>
              ))}
            </div>
          )}
          {suggestions.dresses.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Dresses</div>
              {suggestions.dresses.map((suggestion, index) => {
                const globalIndex = suggestions.shops.length + index;
                return (
                  <div
                    key={`dress-${suggestion.id}-${suggestion.category}`}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center transition-colors duration-150 ${
                      globalIndex === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <Shirt className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="flex-1">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 ml-2">{suggestion.category}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;