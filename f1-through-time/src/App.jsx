import HeroBanner from "./components/layout/HeroBanner";
import Navbar from "./components/layout/Navbar";

import IntroductionSection from "./sections/IntroductionSection";
import HistorySection from "./sections/HistorySection";
import PilotsSection from "./sections/PilotsSection";

function App() {
  return (
    <>
      <HeroBanner />

      <Navbar />

      <IntroductionSection />
      
      <HistorySection />
      <PilotsSection />
    </>
  );
}

export default App;