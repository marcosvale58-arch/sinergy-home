import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InventoryItem } from "./mock-data";

export interface ShoppingListPdfOptions {
  householdName?: string;
  items: InventoryItem[];
}

export function generateShoppingListPdf({ householdName = "Hogar Principal", items }: ShoppingListPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [79, 70, 229]; // #4F46E5 Indigo
  const slateDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const slateMuted: [number, number, number] = [100, 116, 139]; // #64748B
  const roseColor: [number, number, number] = [225, 29, 72]; // #E11D48
  const cardBg: [number, number, number] = [248, 250, 252]; // #F8FAFC

  // 1. Header Banner / Brand
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SINERGY HOME", 14, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("SISTEMA DE GESTIÓN INTELIGENTE DEL HOGAR", 55, 11);

  // 2. Title & Metadata
  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Lista de Compras de Suministros", 14, 30);

  doc.setTextColor(...roseColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ALERTA: ARTÍCULOS EN NIVEL CRÍTICO DE STOCK", 14, 36);

  // Info Box
  doc.setFillColor(...cardBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 41, 182, 18, 2, 2, "FD");

  const today = new Date();
  const dateFormatted = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slateMuted);
  doc.text("Hogar:", 18, 48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text(householdName, 32, 48);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Fecha:", 18, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text(capitalizedDate, 32, 54);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Artículos Críticos:", 125, 48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...roseColor);
  doc.text(`${items.length} artículo(s)`, 158, 48);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Estado:", 125, 54);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("Pendiente de reposición", 158, 54);

  // 3. Category Formatter Helper
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "Pantry":
        return "Despensa";
      case "Cleaning":
        return "Limpieza";
      case "Toiletries":
        return "Higiene";
      case "Medicine":
        return "Medicina";
      default:
        return category;
    }
  };

  // 4. Prepare Table Data
  const tableData = items.map((item, index) => {
    const current = Number(item.currentQuantity);
    const min = Number(item.minQuantity);
    const deficit = Math.max(1, Math.round((min - current) * 10) / 10);
    const suggestedBuy = deficit > 0 ? `${deficit} ${item.unit}` : `1 ${item.unit}`;

    return [
      (index + 1).toString(),
      item.name,
      getCategoryLabel(item.category),
      `${current} ${item.unit}`,
      `${min} ${item.unit}`,
      suggestedBuy,
      "[   ]",
    ];
  });

  // 5. Build AutoTable
  autoTable(doc, {
    startY: 65,
    head: [["Nº", "Artículo / Suministro", "Categoría", "Stock Actual", "Mínimo", "Sugerido Comprar", "Comprado"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
      cellPadding: 3.5,
    },
    bodyStyles: {
      textColor: slateDark,
      fontSize: 9,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { fontStyle: "bold", cellWidth: 52 },
      2: { cellWidth: 28 },
      3: { halign: "center", cellWidth: 25, textColor: roseColor },
      4: { halign: "center", cellWidth: 22 },
      5: { halign: "center", cellWidth: 30, fontStyle: "bold", textColor: primaryColor },
      6: { halign: "center", cellWidth: 15, fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 12, 196, pageHeight - 12);

      doc.setFontSize(8);
      doc.setTextColor(...slateMuted);
      doc.setFont("helvetica", "normal");
      doc.text("Sinergy Home • Gestión Inteligente del Hogar", 14, pageHeight - 7);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, 175, pageHeight - 7);
    },
  });

  // 6. Output filename with current date YYYY-MM-DD
  const dateStr = today.toISOString().split("T")[0];
  doc.save(`Lista_de_Compras_SinergyHome_${dateStr}.pdf`);
}
