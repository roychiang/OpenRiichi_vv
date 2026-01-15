import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GamePage } from "./pages/GamePage";

export default function App() {
  return (
    <div className="w-full h-screen">
      <GamePage />
    </div>
  );
}