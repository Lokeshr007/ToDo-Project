function ExecutionGraph(){

  return(

    <section className="py-32 text-center">

      <h2 className="text-4xl font-bold mb-12">
        Execution Graph
      </h2>

      <div className="flex justify-center gap-10">

        {["Idea","Plan","Execute","Complete"].map(node=>(

          <div
            key={node}
            className="bg-white p-8 rounded-2xl shadow"
          >
            {node}
          </div>

        ))}

      </div>

    </section>
  );
}

export default ExecutionGraph;