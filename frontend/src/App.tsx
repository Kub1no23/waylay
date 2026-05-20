import { useState } from "react";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p className="text-lg font-bold">corporate is hell</p>
      <div className="w-20 h-10 bg-red-200 rounded-lg">
        <button onClick={() => setCount(count + 1)}>I agree: {count}</button>
      </div>
    </>
  );
}

export default App;
