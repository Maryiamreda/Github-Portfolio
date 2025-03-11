"use client";

import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [comparisonData, setComparisonData] = useState({
        userData: null,
        userToCompareData: null
    });

    return (
        <UserContext.Provider value={{ comparisonData, setComparisonData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}