import { useState, useEffect,useContext } from 'react'
import { useNavigate } from 'react-router-dom';

import { TodoContext } from '../context/TodoContext';
import Login from "./Login"
function TodoPage() {
   
   const {
      tasks,
      input,
      
      setInput,
      editId,
      editValue,
      
      setEditValue,
      addTask,
      editTask,
      updateTask,
      deleteTask,
      toggleStatus
   } = useContext(TodoContext)

   const navigate = useNavigate()

   const logout = ()=>{
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    navigate("/login")

   }

   const pendingTasks = tasks.filter(t => t.status !== "COMPLETED");
   const completedTasks = tasks.filter(t => t.status === "COMPLETED");

   const completedCount = completedTasks.length;
   const totalCount =tasks.length;
 
  return (
    <div className='min-h-screen bg-gray-100 flex justify-center items-center'>

      <div className='bg-white shadow-lg rounded-xl p-6 w-[420px]'>
        <div className=' relative flex items-center mb-2'>
          <h1 className='text-2xl fnt-bold text-center mb-5 w-full'>TODO-App</h1>
          <button className='absolute right-0 bg-blue-800 px-3 py-2 rounded-xl font-mono text-white ' onClick={logout}>Logout</button>
        </div>

        

        <p className='text-center text-sm text-gray-500 mb-4'>
        {completedCount}/{totalCount} Completed
      </p>
      <div className='flex gap-2 mb-4'>

      
      <input
        className='border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-blue-900'
        placeholder="task..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if(e.key === "Enter"){
            addTask();
          }
        }}
      />

      <button onClick={addTask} className='bg-blue-500 text-white px-2 rounded-2xl hover:bbg-blue-600'>Add Task</button>
      </div>

       <h2 className='font-semibold mb-2'>Pending</h2>

       <ul className="space-y-2">

        
      {pendingTasks.map(t => (

        <li
          key={t.id}
          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg transition-all duration-300 hover:scale-[1.02]"
        >

          {editId === t.id ? (

            <div className="flex gap-2 w-full">

              <input
                className="border  px-2 py-1 "
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e)=>{
                  if(e.key === "Enter"){
                    updateTask(t.id)
                  }
                }}
              />

              <button
                onClick={() => updateTask(t.id)}
                className="bg-green-500 text-white px-3 rounded hover:bg-green-600"
              >
                Save
              </button>

            </div>

          ) : (

            <>

              <div className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleStatus(t.id)}
                  className="w-4 h-4"
                />
                <span >{t.item}</span>

              </div>
              

              <div className="flex gap-2">

                <button
                  onClick={() => editTask(t)}
                  className="bg-yellow-400 px-3 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                >
                  Delete
                </button>

              </div>

            </>

          )}

        </li>

      ))}

    </ul>
      <h2>Completed</h2>
    <ul className='space-y-2'>

      {completedTasks.map(t => (
        <li key={t.id} className='flex justify-between items-center bg-green-50 p-3 rounded'>
          <div className='flex items-center gap-2'>
              <input 
              type='checkbox'
              checked={true}
              onChange={()=>toggleStatus(t.id)}
              />

              <span className=' text-gray-400'>
                
                {t.item}
                
              </span>

          </div>
          <span className={`px-2 py-1 text-xs rounded ${t.status === "COMPLETED" ? "bg-green-200 text-green-700":"bg-yellow-700"}`} >{t.status}</span>

          <button onClick={()=> deleteTask(t.id)}> Delete</button>
        </li>
      ))}

    </ul>
      
    </div>

    </div>
  );
}

export default TodoPage;
