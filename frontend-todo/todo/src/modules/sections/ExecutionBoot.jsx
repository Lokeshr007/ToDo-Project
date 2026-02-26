import { useEffect, useRef } from "react";
import gsap from "gsap";

function ExecutionBoot(){

  const ref = useRef();

  useEffect(()=>{

    gsap.from(ref.current.children,{
      opacity:0,
      y:30,
      stagger:0.4,
      duration:1
    });

  },[]);

  return(

    <section className="min-h-screen flex flex-col justify-center items-center text-center">

      <div ref={ref}>

        <h1 className="text-6xl font-bold">
          ExecutionOS Booting...
        </h1>

        <div className="mt-12 bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-xl">

          <p>Initializing Workspace...</p>
          <p>Mapping Execution Graph...</p>
          <p>AI Calibrating Workflow...</p>

        </div>

      </div>

    </section>
  );
}

export default ExecutionBoot;