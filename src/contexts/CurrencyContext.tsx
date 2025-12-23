'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ExchangeRate {
  usd: number;
  eur: number;
  date: string;
}

interface CurrencyContextType {
  currency: 'USD' | 'VES';
  exchangeRate: number | null;
  toggleCurrency: () => void;
  setCurrency: (currency: 'USD' | 'VES') => void;
  loading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'USD' | 'VES'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRate();
    // Refresh every 30 minutes
    const interval = setInterval(fetchExchangeRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.dolarvzla.com/public/exchange-rate');

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }

      const data = await response.json();

      // Using EUR rate as specified (conversion to bolivares)
      if (data.current && data.current.eur) {
        setExchangeRate(data.current.eur);
        setError(null);
      } else {
        throw new Error('Invalid exchange rate data');
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('No se pudo cargar la tasa de cambio');
      // Fallback rate if API fails
      setExchangeRate(339.25);
    } finally {
      setLoading(false);
    }
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        toggleCurrency,
        setCurrency,
        loading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
