import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Title from "@/pages/Title";
import Play from "@/pages/Play";
import Run from "@/pages/Run";
import Upgrades from "@/pages/Upgrades";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Title />} />
          <Route path="/play" element={<Play />} />
          <Route path="/run" element={<Run />} />
          <Route path="/upgrades" element={<Upgrades />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
