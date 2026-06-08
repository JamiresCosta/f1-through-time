import HeroBanner from "./components/layout/HeroBanner";
import Navbar from "./components/layout/Navbar";

import IntroductionSection from "./sections/IntroductionSection";
import HistorySection from "./sections/HistorySection";

function App() {
  return (
    <>
      <HeroBanner />

      <Navbar />

      <IntroductionSection />
      
      <HistorySection />
    </>
  );
}

export default App;