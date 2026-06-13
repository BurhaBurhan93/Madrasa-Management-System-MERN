import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { CALENDAR_SYSTEMS, getCalendarSystem, setCalendarSystem } from '../lib/dateUtils';

const CalendarContext = createContext();

export const CalendarProvider = ({ children, panelPrefix }) => {
  const [calSys, setCalSys] = useLocalStorage(`${panelPrefix}Calendar`, CALENDAR_SYSTEMS.GREGORIAN);

  const updateCalendar = (newCal) => {
    setCalSys(newCal);
  };

  return (
    <CalendarContext.Provider value={{ calSys, setCalSys: updateCalendar, panelPrefix }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export default CalendarContext;
