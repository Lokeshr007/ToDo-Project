import {createContext} from "react"
import useTodos from "../hooks/useTodos"

export const TodoContext = createContext();

export const TodoProvider = ({children}) => {
    const todoLogic = useTodos();

    return (
        <TodoContext.Provider value={todoLogic}>
            {children}
        </TodoContext.Provider>
    )
}