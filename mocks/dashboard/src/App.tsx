import { ClockSection } from "./components/ClockSection";
import { MinimalAgenda } from "./components/MinimalAgenda";

export default function App() {
  return (
    <div className="size-full bg-slate-950 flex gap-12 p-12">
      {/* Left Side - Clock and Day Times */}
      <div className="w-[550px] flex-shrink-0">
        <ClockSection />
      </div>
      
      {/* Right Side - Minimal Agenda */}
      <div className="w-[600px] flex-shrink-0">
        <MinimalAgenda />
      </div>
    </div>
  );
}
