import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chore, User } from "./mock-data";

export interface ChoresPdfOptions {
  householdName?: string;
  chores: Chore[];
  users: User[];
  filterMemberName?: string;
  filterStatus?: "ALL" | "PENDING" | "COMPLETED";
}

export function generateChoresListPdf({
  householdName = "Hogar Principal",
  chores,
  users,
  filterMemberName,
  filterStatus = "ALL",
}: ChoresPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [79, 70, 229]; // #4F46E5 Indigo
  const slateDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const slateMuted: [number, number, number] = [100, 116, 139]; // #64748B
  const emeraldColor: [number, number, number] = [5, 150, 105]; // #059669
  const amberColor: [number, number, number] = [217, 119, 6]; // #D97706
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
  doc.text("GESTIÓN INTELIGENTE Y GAMIFICACIÓN DEL HOGAR", 55, 11);

  // 2. Title & Metadata
  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Lista de Tareas y Responsabilidades", 14, 30);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CONTROL DE RESPONSABILIDADES Y PUNTOS DE RECOMPENSA", 14, 36);

  // Info Box
  doc.setFillColor(...cardBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 41, 182, 20, 2, 2, "FD");

  const today = new Date();
  const dateFormatted = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const pendingCount = chores.filter((c) => c.status === "PENDING").length;
  const completedCount = chores.filter((c) => c.status === "COMPLETED").length;
  const totalPoints = chores.reduce((sum, c) => sum + (c.pointsReward || 0), 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text("Hogar:", 18, 48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text(householdName, 32, 48);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Fecha:", 18, 55);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text(capitalizedDate, 32, 55);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Filtro:", 100, 48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  const filterLabel = filterMemberName && filterMemberName !== "ALL" ? `Miembro: ${filterMemberName}` : "Todos los miembros";
  doc.text(filterLabel, 112, 48);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Estado:", 100, 55);
  doc.setFont("helvetica", "bold");
  const statusLabel = filterStatus === "PENDING" ? "Solo Pendientes" : filterStatus === "COMPLETED" ? "Solo Completadas" : "Todas las tareas";
  doc.setTextColor(...slateDark);
  doc.text(statusLabel, 112, 55);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Total Tareas:", 155, 48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text(`${chores.length} (${pendingCount} pend. / ${completedCount} comp.)`, 172, 48);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slateMuted);
  doc.text("Puntos:", 155, 55);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...amberColor);
  doc.text(`${totalPoints} pts en juego`, 172, 55);

  // 3. User lookup helper
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return "Sin asignar";
    const roleTag = user.role === "CHILD" ? " (Niño/a)" : user.role === "ADMIN" ? " (Admin)" : "";
    return `${user.name}${roleTag}`;
  };

  // 4. Prepare Table Data
  const tableData = chores.map((chore, index) => {
    const assignedUser = getUserName(chore.assignedToUserId);
    const isCompleted = chore.status === "COMPLETED";
    const statusText = isCompleted ? "COMPLETADA" : "PENDIENTE";
    const checkSymbol = isCompleted ? "[ X ]" : "[   ]";

    return [
      (index + 1).toString(),
      chore.title,
      assignedUser,
      `+${chore.pointsReward} pts`,
      statusText,
      checkSymbol,
    ];
  });

  // 5. Build AutoTable
  autoTable(doc, {
    startY: 67,
    head: [["Nº", "Descripción de la Tarea", "Asignado a", "Recompensa", "Estado", "Verificado"]],
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
      1: { fontStyle: "bold", cellWidth: 65 },
      2: { cellWidth: 42 },
      3: { halign: "center", cellWidth: 25, fontStyle: "bold", textColor: amberColor },
      4: { halign: "center", cellWidth: 25, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 15, fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    didParseCell: (data) => {
      // Color code the status column
      if (data.section === "body" && data.column.index === 4) {
        if (data.cell.raw === "COMPLETADA") {
          data.cell.styles.textColor = emeraldColor;
        } else if (data.cell.raw === "PENDIENTE") {
          data.cell.styles.textColor = amberColor;
        }
      }
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
      doc.text("Sinergy Home • Módulo de Tareas y Tiempo de Pantalla", 14, pageHeight - 7);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, 175, pageHeight - 7);
    },
  });

  // 6. Save PDF file
  const dateStr = today.toISOString().split("T")[0];
  doc.save(`Lista_de_Tareas_SinergyHome_${dateStr}.pdf`);
}
