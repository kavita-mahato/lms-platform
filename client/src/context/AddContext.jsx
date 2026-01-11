import { createContext } from "react";

const AddContext = createContext();

export const AppContextProvider = (props) => {

    const value = {
        // Add context values here
    };
    
  return (
    <AddContext.Provider value={value}>
        {props.children}
    </AddContext.Provider>
  );
};

export default AddContext;