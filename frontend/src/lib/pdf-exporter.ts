"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(elementId: string, filename: string = "Streamlit_Financial_Report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Show a loading state or handle feedback here if needed
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      backgroundColor: "#020617", // slate-950
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
}
