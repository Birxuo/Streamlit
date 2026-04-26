"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(elementId: string, filename: string = "Streamlit_Financial_Report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Show a loading state or handle feedback here if needed
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#020617",
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all charts have a defined height in the clone
        const charts = clonedDoc.querySelectorAll(".recharts-responsive-container");
        charts.forEach((chart) => {
          (chart as HTMLElement).style.width = "800px";
          (chart as HTMLElement).style.height = "350px";
        });
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
      hotfixes: ["px_scaling"]
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
}
