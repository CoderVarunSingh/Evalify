import React from "react";
import Navbar from "../components/Navbar";
import CodingAnalyticsView from "../components/CodingAnalyticsView";

function CodingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CodingAnalyticsView />
      </div>
    </div>
  );
}

export default CodingAnalyticsPage;
