import "../../index.css";

import Header from "../components/sections/Header";
import Hero from "../components/sections/landing/Hero";
import HowItWorks from "../components/sections/landing/HowItWorks";
import Features from "../components/sections/landing/Features";
import MatchSection from "../components/sections/landing/MatchSection";
import Testimonials from "../components/sections/landing/Testimonials";
import CTA from "../components/sections/landing/CTA";
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
