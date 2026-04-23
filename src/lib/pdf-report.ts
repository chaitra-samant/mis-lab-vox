import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePDFReport(data: any) {
  const { metrics, insights, themes, departmentData, timestamp } = data;
  const doc = new jsPDF();

  const primaryColor = [139, 92, 246] as [number, number, number]; // Violet-500 (#8b5cf6)
  const secondaryColor = [15, 23, 42] as [number, number, number]; // Slate-900 (#0f172a)
  const mutedColor = [100, 116, 139] as [number, number, number];

  // Sanitization helper to avoid weird PDF kerning issues
  const sanitize = (text: string) => {
    return text.replace(/[^\x00-\x7F]/g, "").trim(); // Remove non-ASCII characters
  };

  const cleanSummary = sanitize(insights.summary);

  // --- Header & Branding ---
  // Vox Logo (Simplified for PDF)
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(14, 15, 10, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("V", 17, 22);

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(18);
  doc.text("Vox", 26, 23);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Executive Intelligence Briefing", 14, 32);
  doc.text(`Generated on ${new Date(timestamp).toLocaleString()}`, 14, 37);
  
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // --- Section 1: Executive Summary ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Executive Summary", 14, 52);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85); // Slate-700
  const summaryLines = doc.splitTextToSize(cleanSummary, 180);
  doc.text(summaryLines, 14, 60);

  // --- Section 2: Key Metrics ---
  let currentY = 60 + (summaryLines.length * 7);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Key Performance Indicators", 14, currentY + 10);
  
  const kpiData = [
    ["Metric", "Value", "Status"],
    ["Total Vox Volume", metrics.totalVolume.toLocaleString(), "Normal"],
    ["Average Sentiment Score", (metrics?.avgSentiment || 0).toFixed(2), (metrics?.avgSentiment || 0) < -0.3 ? "Critical" : "Stable"],
    ["Financial Exposure", `INR ${metrics.totalExposure.toLocaleString()}`, "Risk Awareness"],
    ["SLA Compliance", `${metrics.slaCompliance}%`, "Target Met"]
  ];

  autoTable(doc, {
    startY: currentY + 15,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: "striped",
    headStyles: { fillColor: primaryColor },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY;

  // --- Section 3: Departmental Health ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Departmental Breakdown", 14, currentY + 15);

  const tableData = departmentData.map((d: any) => [
    d.name,
    d.volume.toString(),
    `INR ${d.exposure.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: currentY + 20,
    head: [["Department", "Volume", "Exposure"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: secondaryColor },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold', textColor: [190, 18, 60] } // rose-700
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY;

  // --- Section 4: Strategic Recommendations ---
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("AI Strategic Recommendations", 14, currentY + 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  
  insights.recommendations.forEach((rec: string, i: number) => {
    const recLines = doc.splitTextToSize(`${i + 1}. ${rec}`, 175);
    doc.text(recLines, 14, currentY + 25 + (i * 15));
  });

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Confidential · Vox Business Health Report · Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`Vox_Business_Health_${new Date().toISOString().split('T')[0]}.pdf`);
}
