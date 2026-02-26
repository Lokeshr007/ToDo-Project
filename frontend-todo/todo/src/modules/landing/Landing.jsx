import ExecutionBoot from "../sections/ExecutionBoot";
import ChaosTransform from "../sections/ChaosTransform";
import ExecutionGraph from "../sections/ExecutionGraph";
import AISimulation from "../sections/AISimulation";
import WorkflowSimulator from "../sections/WorkflowSimulator";
import ValueEngine from "../sections/ValueEngine";
import Footer from "../sections/Footer";

function LandingPage(){

  return(

    <div className="bg-[#f8fafc] text-slate-900 overflow-hidden">

      <ExecutionBoot/>
      <ChaosTransform/>
      <ExecutionGraph/>
      <AISimulation/>
      <WorkflowSimulator/>
      <ValueEngine/>
      <Footer/>

    </div>
  );
}

export default LandingPage;