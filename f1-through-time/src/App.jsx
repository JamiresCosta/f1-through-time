import HeroBanner from "./components/layout/HeroBanner";
import Navbar from "./components/layout/Navbar";

import IntroductionSection from "./sections/IntroductionSection";
import HistorySection from "./sections/HistorySection";
import PilotsSection from "./sections/PilotsSection";
import ConstructorsSection from "./sections/ConstructorsSection";
import CircuitsSection from "./sections/CircuitsSection";
import ModernSection from "./sections/ModernSection";

function App() {
  return (
    <>
      <HeroBanner />

      <Navbar />

      <IntroductionSection />
      
      <HistorySection />

      <PilotsSection />

      <ConstructorsSection />

      <CircuitsSection />

      <ModernSection />
      
    </>
  );
}

export default App;