import { createContext, useContext, useReducer } from 'react';

// Initial state for users
const initialState = {
  users: [],
};

// Reducer function to handle state updates
const usersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload)
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        )
      };
    default:
      return state;
  }
};

// Create context
export const UsersContext = createContext();

// Custom hook to use the UsersContext
export const useUsersContext = () => {
  return useContext(UsersContext);
};

// Create provider component
export const UsersContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  return (
    <UsersContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
};
