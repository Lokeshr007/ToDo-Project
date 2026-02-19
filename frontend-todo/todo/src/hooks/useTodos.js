import {useState,useEffect} from "react";
import axios from "axios"
import API from "../services/api";


export default function useTodos(){
    
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");


  useEffect(() => {
    API.get("/todo/")
      .then(res => setTasks(res.data))
      .catch(err => console.log(err));
  }, []);

  const addTask = async () => {

    if(!input.trim()) return;

    try {

      const res = await API.post("/todo/", {
        item: input
      });

      setTasks(prev => [...prev, res.data]);
      setInput("");

    } catch(err){
      console.log(err);
    }
  };

  const editTask = (task) => {
    setEditId(task.id);
    setEditValue(task.item);
  };

  const updateTask = async (id) => {

    try {

      await API.put(`/todo/${id}`, {
        item: editValue
      });

      setTasks(prev =>
        prev.map(t =>
          t.id === id ? { ...t, item: editValue } : t
        )
      );

      setEditId(null);    
      setEditValue("");

    } catch(err){
      console.log(err);
    }
  };

  const deleteTask = async (id) => {

    try {

      await API.delete(`/todo/${id}`);

      setTasks(prev => prev.filter(t => t.id !== id));

    } catch(err){
      console.log(err);
    }
  };
    const toggleStatus = async (id) => {

    const res = await API.put(`/todo/status/${id}`);

    setTasks(prev =>
        prev.map(t => t.id === id ? res.data : t)
    );
    }

    return {
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
   };
}