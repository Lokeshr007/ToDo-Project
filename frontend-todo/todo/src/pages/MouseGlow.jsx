import { useEffect, useState } from "react";

function MouseGlow() {

  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {

    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);

    return () => window.removeEventListener("mousemove", handleMove);

  }, []);

  return (

    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: `radial-gradient(600px at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.15), transparent 80%)`,
      }}
    />

  );
}

export default MouseGlow;