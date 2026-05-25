import React, { createContext, useContext, useState } from 'react';

interface CoinContextType {
  balance: number;
  consumeCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  isStoreVisible: boolean;
  setIsStoreVisible: (visible: boolean) => void;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const CoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(10); // Start with 10 coins as requested
  const [isStoreVisible, setIsStoreVisible] = useState(false);

  const consumeCoins = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const addCoins = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <CoinContext.Provider
      value={{
        balance,
        consumeCoins,
        addCoins,
        isStoreVisible,
        setIsStoreVisible,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return context;
};
