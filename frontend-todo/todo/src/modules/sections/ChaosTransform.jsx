import { useEffect, useRef } from "react";
import gsap from "gsap";

function ChaosTransform(){

  const ref = useRef();

  useEffect(()=>{

    gsap.from(ref.current.children,{
      x:"random(-300,300)",
      y:"random(-100,100)",
      opacity:0,
      stagger:0.2
    });

  },[]);

  return(

    <section className="py-32 text-center">

      <h2 className="text-4xl font-bold mb-12">
        From Chaos → Structured Execution
      </h2>

      <div ref={ref} className="flex justify-center gap-6">

        <div className="bg-red-100 p-6 rounded-xl">Ideas</div>
        <div className="bg-yellow-100 p-6 rounded-xl">Notes</div>
        <div className="bg-blue-100 p-6 rounded-xl">Tasks</div>
        <div className="bg-green-100 p-6 rounded-xl">Goals</div>

      </div>

    </section>
  );
}

export default ChaosTransform;