import { useEffect } from "react";
import gsap from "gsap";

function WorkflowSimulator(){

  useEffect(()=>{

    gsap.to(".taskMove",{
      x:140,
      duration:2,
      repeat:-1,
      yoyo:true
    });

  },[]);

  return(

    <section className="py-32 text-center">

      <h2 className="text-4xl font-bold mb-12">
        Execution in Motion
      </h2>

      <div className="flex justify-center gap-10">

        <div className="bg-white p-6 rounded-2xl shadow w-40">
          <p>Todo</p>
          <div className="taskMove bg-slate-100 mt-4 p-2 rounded">
            Task
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow w-40">
          Doing
        </div>

        <div className="bg-white p-6 rounded-2xl shadow w-40">
          Done
        </div>

      </div>

    </section>
  );
}

export default WorkflowSimulator;