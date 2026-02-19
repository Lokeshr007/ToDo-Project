function TaskItem(t,editId,editValue,editTask,updateTask,deleteTask,toggleStatus){
         return (

   <li className="flex justify-between items-center bg-gray-50 p-3 rounded">

     {editId === t.id ? (

        <>
          <input
            autoFocus
            value={editValue}
            onChange={(e)=>setEditValue(e.target.value)}
          />

          <button onClick={()=>updateTask(t.id)}>Save</button>
        </>

     ) : (

        <>
          <div className="flex gap-2">

            <input
              type="checkbox"
              checked={t.status === "COMPLETED"}
              onChange={()=>toggleStatus(t.id)}
            />

            <span className={t.status==="COMPLETED"?"line-through":""}>
              {t.item}
            </span>

          </div>

          <div>
            <button onClick={()=>editTask(t)}>Edit</button>
            <button onClick={()=>deleteTask(t.id)}>Delete</button>
          </div>
        </>
     )}

   </li>

 );
}

export default TaskItem;