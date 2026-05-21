import "../../index.css";

import Header from "../components/sections/Header";
import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import Features from "../components/sections/Features";
import MatchSection from "../components/sections/MatchSection";
import Testimonials from "../components/sections/Testimonials";
import CTA from "../components/sections/CTA";
import Footer from "../components/sections/Footer";

function LandingPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <HowItWorks />
          <Features />
          <MatchSection />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default LandingPage;
