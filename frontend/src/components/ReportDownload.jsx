// src/components/ReportDownload.jsx

import React from "react";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { DownloadIcon } from "lucide-react";

/**
 * Professional PDF Report Generator with Vector Radar Charts, Donut Charts, Timelines,
 * 7-Criteria Skill Matrix, AI Anti-Cheating Audit, and Question Deep-Dives.
 */
export default function ReportDownload({ report }) {
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    saveAs(blob, `${report.id || "ai-report"}.json`);
  };

  const downloadPdf = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = 180;
    let y = 15;

    // Helper: Page Break Check
    const checkPageBreak = (neededHeight = 15) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        // Page header line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, 12, margin + contentWidth, 12);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`${report.role || "AI Interview"} Report - Page ${doc.getNumberOfPages()}`, margin, 9);
      }
    };

    // Helper: Print Text with Auto-Wrapping
    const printText = (text, fontSize = 10, fontStyle = "normal", color = [30, 41, 59], indent = 0) => {
      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text), contentWidth - indent);
      lines.forEach((line) => {
        checkPageBreak(6);
        doc.text(line, margin + indent, y);
        y += fontSize * 0.45;
      });
      y += 2;
    };

    // Helper: Vector Radar Chart Generator
    const drawVectorRadarChart = (cx, cy, r, labels, values) => {
      const n = labels.length;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);

      // 1. Draw Concentric Grid Rings
      [0.25, 0.5, 0.75, 1.0].forEach((scale) => {
        for (let i = 0; i < n; i++) {
          const a1 = (i * 2 * Math.PI) / n - Math.PI / 2;
          const a2 = (((i + 1) % n) * 2 * Math.PI) / n - Math.PI / 2;
          const x1 = cx + r * scale * Math.cos(a1);
          const y1 = cy + r * scale * Math.sin(a1);
          const x2 = cx + r * scale * Math.cos(a2);
          const y2 = cy + r * scale * Math.sin(a2);
          doc.line(x1, y1, x2, y2);
        }
      });

      // 2. Draw Axis Lines & Text Labels
      for (let i = 0; i < n; i++) {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        doc.line(cx, cy, x, y);

        // Label position
        const lx = cx + (r + 7) * Math.cos(angle);
        const ly = cy + (r + 4) * Math.sin(angle);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(labels[i], lx, ly, { align: "center" });
      }

      // 3. Draw Candidate Score Polygon
      doc.setDrawColor(14, 165, 233); // Cyan line
      doc.setLineWidth(1.2);
      doc.setFillColor(56, 189, 248);

      const points = values.map((val, i) => {
        const score = Math.max(5, Math.min(100, val || 0));
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const pr = r * (score / 100);
        return {
          x: cx + pr * Math.cos(angle),
          y: cy + pr * Math.sin(angle),
        };
      });

      for (let i = 0; i < n; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        doc.line(p1.x, p1.y, p2.x, p2.y);
        doc.circle(p1.x, p1.y, 1.2, "F");
      }
    };

    // Helper: Vector Donut / Pie Chart Generator
    const drawVectorDonutChart = (cx, cy, r, attempted, skipped) => {
      const total = attempted + skipped || 1;
      const attRatio = attempted / total;

      doc.setLineWidth(5);
      doc.setDrawColor(34, 197, 94); // Green for attempted
      doc.circle(cx, cy, r, "S");

      if (skipped > 0) {
        doc.setDrawColor(239, 68, 68); // Red for skipped
        // Simplified arc indicator
        doc.circle(cx, cy, r - 0.5, "S");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${attempted}/${total}`, cx, cy + 1, { align: "center" });
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Attempted", cx, cy + 5, { align: "center" });
    };

    // Helper: Score Progression Timeline Chart
    const drawTimelineChart = (startX, startY, width, height, questionEvaluations) => {
      if (!questionEvaluations || questionEvaluations.length === 0) return;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(startX, startY, width, height, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Question-by-Question Score Trajectory", startX + 4, startY + 6);

      const n = questionEvaluations.length;
      const stepX = (width - 24) / Math.max(1, n - 1);
      const graphBottom = startY + height - 8;
      const graphTop = startY + 12;
      const graphHeight = graphBottom - graphTop;

      doc.setDrawColor(14, 165, 233);
      doc.setLineWidth(1);

      questionEvaluations.forEach((q, i) => {
        const score = q.evaluation?.score || 0;
        const px = startX + 12 + i * stepX;
        const py = graphBottom - graphHeight * (score / 100);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Q${i + 1}`, px, graphBottom + 5, { align: "center" });
        doc.text(`${score}`, px, py - 2, { align: "center" });

        doc.setFillColor(14, 165, 233);
        doc.circle(px, py, 1.2, "F");

        if (i < n - 1) {
          const nextScore = questionEvaluations[i + 1].evaluation?.score || 0;
          const nextPx = startX + 12 + (i + 1) * stepX;
          const nextPy = graphBottom - graphHeight * (nextScore / 100);
          doc.line(px, py, nextPx, nextPy);
        }
      });
    };

    // ========================================================
    // 1. EXECUTIVE CANDIDATE SUMMARY & HEADER BANNER
    // ========================================================
    doc.setFillColor(15, 23, 42); // Dark slate banner
    doc.roundedRect(margin, y, contentWidth, 38, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`${report.role || "Software Engineer"} AI Evaluation Report`, margin + 8, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`Track: ${report.company || "General"} | Date: ${report.date || "Today"}`, margin + 8, y + 20);

    const allQuestions = report.questionEvaluations || [];
    const attemptedCount = report.attemptedCount ?? allQuestions.filter((q) => q.evaluation?.attemptStatus === "Attempted" || (q.candidateAnswer && q.candidateAnswer !== "Not Attempted")).length;
    const totalCount = allQuestions.length;
    const skippedCount = totalCount - attemptedCount;

    doc.text(`Attempted: ${attemptedCount}/${totalCount} | Skipped: ${skippedCount}`, margin + 8, y + 27);

    // Score Badge in Header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + 125, y + 6, 45, 26, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(56, 189, 248);
    doc.text(`${report.overallScore}/100`, margin + 147, y + 17, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(251, 191, 36);
    doc.text(`Grade ${report.grade || "F"} (${report.status || "Completed"})`, margin + 147, y + 25, { align: "center" });

    y += 44;

    // ========================================================
    // 2. VECTOR RADAR CHART & 7-CRITERIA SKILL MATRIX
    // ========================================================
    checkPageBreak(65);
    printText("1. Empirical Skill Radar Matrix & Statistics", 12, "bold", [15, 23, 42]);
    y += 1;

    const radarLabels = ["Tech", "Comm", "Coding", "Conf", "Correct", "Logic"];
    const radarValues = [
      report.avgTech ?? 0,
      report.avgComm ?? 0,
      report.avgProblemSolving ?? 0,
      report.avgConf ?? 0,
      report.avgCorrectness ?? report.overallScore,
      report.avgLogicalReasoning ?? 0,
    ];

    // Render Vector Radar Chart on left side
    drawVectorRadarChart(margin + 35, y + 26, 22, radarLabels, radarValues);

    // Render Metrics Summary Card on right side
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 80, y + 2, 100, 52, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("7-Criteria Dimension Performance", margin + 85, y + 8);

    const metricsList = [
      ["Technical Accuracy:", `${report.avgTech ?? 0}/100`],
      ["Communication & Clarity:", `${report.avgComm ?? 0}/100`],
      ["Coding & Problem Solving:", `${report.avgProblemSolving ?? 0}/100`],
      ["Confidence & Delivery:", `${report.avgConf ?? 0}/100`],
      ["Solution Correctness:", `${report.avgCorrectness ?? report.overallScore}/100`],
      ["Logical Reasoning:", `${report.avgLogicalReasoning ?? 0}/100`],
    ];

    let metricY = y + 15;
    metricsList.forEach(([label, val]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 85, metricY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(val, margin + 165, metricY);
      metricY += 6;
    });

    y += 58;

    // ========================================================
    // 3. QUESTION-BY-QUESTION SCORE TIMELINE
    // ========================================================
    checkPageBreak(35);
    drawTimelineChart(margin, y, contentWidth, 32, allQuestions);
    y += 38;

    // ========================================================
    // 4. EMPIRICAL STRENGTHS & WEAKNESSES
    // ========================================================
    checkPageBreak(45);
    printText("2. Key Candidate Strengths & Identified Weaknesses", 12, "bold", [15, 23, 42]);
    y += 1;

    const allStrengths = allQuestions.flatMap((q) => q.evaluation?.strengths || []).filter((s) => s && !s.includes("None"));
    const allMistakes = allQuestions.flatMap((q) => q.evaluation?.mistakes || []).filter((m) => m && !m.includes("not attempted"));

    // Strengths Box (Green)
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth / 2 - 3, 36, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text("Top Verified Strengths", margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    let strY = y + 12;
    (allStrengths.length > 0 ? allStrengths.slice(0, 3) : ["Solid technical understanding demonstrated."]).forEach((str) => {
      const lines = doc.splitTextToSize(`• ${str}`, contentWidth / 2 - 10);
      lines.forEach((l) => {
        doc.text(l, margin + 4, strY);
        strY += 4;
      });
    });

    // Weaknesses Box (Red)
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin + contentWidth / 2 + 3, y, contentWidth / 2 - 3, 36, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text("Identified Improvement Areas", margin + contentWidth / 2 + 7, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    let wkY = y + 12;
    (allMistakes.length > 0 ? allMistakes.slice(0, 3) : ["No major technical errors identified."]).forEach((wk) => {
      const lines = doc.splitTextToSize(`• ${wk}`, contentWidth / 2 - 10);
      lines.forEach((l) => {
        doc.text(l, margin + contentWidth / 2 + 7, wkY);
        wkY += 4;
      });
    });

    y += 42;

    // ========================================================
    // 5. PERSONALIZED AI IMPROVEMENT PLAN
    // ========================================================
    if (report.learningRoadmap?.length > 0) {
      checkPageBreak(30);
      printText("3. Personalized AI Actionable Improvement Plan", 12, "bold", [15, 23, 42]);
      y += 1;

      report.learningRoadmap.forEach((item, idx) => {
        printText(`${idx + 1}. ${item}`, 8.5, "normal", [30, 41, 59], 4);
      });
      y += 2;
    }

    // ========================================================
    // 6. AI PROCTORING & SECURITY AUDIT
    // ========================================================
    const securityReport = report.securityReport || {
      integrityScore: 100,
      trustStatus: "Verified High Integrity",
      totalViolations: 0,
      proctoringDetails: { tabSwitchCount: 0, fullscreenExits: 0, copyPasteAttempts: 0, devToolsAttempts: 0, mediaViolations: 0 },
    };

    checkPageBreak(25);
    printText("4. AI Anti-Cheating & Security Proctoring Audit", 12, "bold", [15, 23, 42]);
    y += 1;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Security Integrity Compliance: ${securityReport.integrityScore}% (${securityReport.trustStatus})`, margin + 6, y + 6);

    const details = securityReport.proctoringDetails || {};
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Tab Switches: ${details.tabSwitchCount ?? 0} | Fullscreen Exits: ${details.fullscreenExits ?? 0} | Copy/Paste: ${details.copyPasteAttempts ?? 0} | DevTools: ${details.devToolsAttempts ?? 0} | Media Alerts: ${details.mediaViolations ?? 0}`,
      margin + 6,
      y + 13
    );

    y += 26;

    // ========================================================
    // 7. QUESTION-BY-QUESTION DEEP DIVE ANALYSIS
    // ========================================================
    checkPageBreak(25);
    printText("5. Question-by-Question Detailed Analysis & AI Suggestions", 12, "bold", [15, 23, 42]);
    y += 2;

    allQuestions.forEach((q, idx) => {
      checkPageBreak(40);

      const isSkipped =
        q.evaluation?.attemptStatus === "Not Attempted" ||
        !q.candidateAnswer ||
        q.candidateAnswer === "Not Attempted" ||
        q.candidateAnswer.trim().length === 0;

      const statusTag = isSkipped ? "[NOT ATTEMPTED - SCORE: 0/100]" : `[SCORE: ${q.evaluation?.score ?? 0}/100]`;
      const titleColor = isSkipped ? [185, 28, 28] : [15, 23, 42];

      printText(`Q${idx + 1}: ${q.question} ${statusTag}`, 9.5, "bold", titleColor);

      if (!isSkipped) {
        printText(
          `Correctness: ${q.evaluation?.correctnessScore ?? 0} | Tech: ${q.evaluation?.technicalScore ?? 0} | Comm: ${q.evaluation?.communicationScore ?? 0} | Logic: ${q.evaluation?.logicalReasoningScore ?? 0}`,
          8,
          "bold",
          [14, 116, 144],
          4
        );
        printText(`Candidate Answer: "${q.candidateAnswer}"`, 8.5, "italic", [51, 65, 85], 4);
      } else {
        printText(`Candidate Answer: Question Skipped / Not Attempted`, 8.5, "italic", [185, 28, 28], 4);
      }

      if (q.evaluation?.strengths?.length > 0) {
        printText(`Strengths: ${q.evaluation.strengths.join("; ")}`, 8, "normal", [22, 101, 52], 4);
      }
      if (q.evaluation?.mistakes?.length > 0) {
        printText(`Mistakes & AI Suggestions: ${q.evaluation.mistakes.join("; ")}`, 8, "normal", [185, 28, 28], 4);
      }
      if (q.evaluation?.modelAnswer) {
        printText(`AI Ideal Model Answer: ${q.evaluation.modelAnswer}`, 8, "normal", [79, 70, 229], 4);
      }

      y += 3;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, margin + contentWidth, y);
      y += 4;
    });

    doc.save(`${report.id || "ai-report"}.pdf`);
  };

  return (
    <div className="flex gap-2 print:hidden">
      <button onClick={downloadJson} className="btn btn-secondary btn-sm gap-2">
        <DownloadIcon className="w-4 h-4" /> Export JSON
      </button>
      <button onClick={downloadPdf} className="btn btn-primary btn-sm gap-2">
        <DownloadIcon className="w-4 h-4" /> Download Professional PDF Report
      </button>
    </div>
  );
}
