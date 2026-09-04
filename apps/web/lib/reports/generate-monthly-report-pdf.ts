import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";

export interface SubcategoryCostItem {
  subcategory: string;
  category?: string;
  amount: number;
  label?: string;
  percentage?: number;
}

export interface MonthlyReportPdfOptions {
  periodLabel?: string;
  totalIncome?: number;
  totalCosts?: number;
  netProfitLoss?: number;
  costLimit?: number;
  basicCost?: number;
  fancyCost?: number;
  extraCost?: number;
  subcategoryCosts?: SubcategoryCostItem[] | Record<string, number>;
}

export const SUBCATEGORY_DISPLAY_LABELS: Record<string, string> = {
  food: "Food & Groceries",
  house_hold: "House hold & Supplies",
  taxi: "Taxi & Transportation",
  rent: "Rent & Housing",
  wifi: "Wifi & Utilities",
  drunk: "Nightlife & Drinks",
  coffee: "Café & Coffee",
  familia: "Family & Social",
  cks: "CKS / Electronics",
  cloth: "Apparel & Clothes",
  shoe: "Footwear & Shoes",
  holiday: "Vacations & Holidays",
  other: "Other Expenses",
};

export const SUBCATEGORY_CATEGORY_MAP: Record<string, string> = {
  food: "basic",
  house_hold: "basic",
  taxi: "basic",
  rent: "basic",
  wifi: "basic",
  drunk: "fancy",
  coffee: "fancy",
  familia: "fancy",
  cks: "extra",
  cloth: "extra",
  shoe: "extra",
  holiday: "extra",
  other: "basic",
};

/**
 * Generates an official, downloadable Month-End Financial Summary PDF report
 * complete with category metrics and a detailed subcategory expenditure audit.
 */
export async function generateMonthlyReportPdf(options: MonthlyReportPdfOptions): Promise<Uint8Array> {
  const {
    periodLabel = "Active Period",
    totalIncome = 0,
    totalCosts = 0,
    netProfitLoss = totalIncome - totalCosts,
    costLimit,
    basicCost,
    fancyCost,
    extraCost,
    subcategoryCosts,
  } = options;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions: 595.28 x 841.89 pt
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Design Palette
  const colorPrimary = rgb(0.01, 0.68, 0.01);
  const colorText = rgb(0.06, 0.09, 0.16);
  const colorMuted = rgb(0.40, 0.45, 0.53);
  const colorBorder = rgb(0.85, 0.88, 0.92);
  const colorGreenText = rgb(0.08, 0.50, 0.24);
  const colorRedText = rgb(0.88, 0.15, 0.15);
  const colorCardBg = rgb(0.97, 0.98, 0.99);

  const leftX = 45;
  const rightX = width - 45;
  const contentWidth = rightX - leftX;
  const footerY = 50;

  let currentY = height - 45;

  // --- 1. Header Banner ---
  page.drawRectangle({
    x: leftX,
    y: currentY - 48,
    width: contentWidth,
    height: 58,
    color: rgb(0.98, 1.0, 0.98),
    borderColor: rgb(0.73, 0.92, 0.77),
    borderWidth: 1,
  });

  page.drawText("MC TRACKER", {
    x: leftX + 16,
    y: currentY - 18,
    size: 18,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText("Monthly Financial Summary & Expenditure Audit Report", {
    x: leftX + 16,
    y: currentY - 36,
    size: 9.5,
    font: fontRegular,
    color: colorMuted,
  });

  const badgeText = periodLabel.toUpperCase();
  const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 9) + 18;
  const badgeX = rightX - badgeWidth - 16;
  const badgeY = currentY - 32;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: 22,
    color: colorPrimary,
  });

  page.drawText(badgeText, {
    x: badgeX + 9,
    y: badgeY + 6,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  currentY -= 70;

  // Generated timestamp info
  const dateStr = `Audit Period: ${periodLabel}  •  Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  page.drawText(dateStr, {
    x: leftX,
    y: currentY,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });

  currentY -= 18;

  // --- 2. 4 Summary Metric Cards (2x2 Grid) ---
  const isProfit = netProfitLoss >= 0;
  const cardWidth = (contentWidth - 12) / 2;
  const cardHeight = 54;

  // Card 1: Total Income
  page.drawRectangle({
    x: leftX,
    y: currentY - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: rgb(0.94, 0.99, 0.95),
    borderColor: rgb(0.73, 0.92, 0.77),
    borderWidth: 1,
  });
  page.drawText("TOTAL INCOME", {
    x: leftX + 12,
    y: currentY - 18,
    size: 8.5,
    font: fontBold,
    color: colorGreenText,
  });
  page.drawText(`ETB ${Number(totalIncome).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, {
    x: leftX + 12,
    y: currentY - 40,
    size: 15,
    font: fontBold,
    color: colorGreenText,
  });

  // Card 2: Total Costs
  const card2X = leftX + cardWidth + 12;
  page.drawRectangle({
    x: card2X,
    y: currentY - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1.0, 0.95, 0.95),
    borderColor: rgb(0.99, 0.79, 0.79),
    borderWidth: 1,
  });
  page.drawText("TOTAL EXPENSES", {
    x: card2X + 12,
    y: currentY - 18,
    size: 8.5,
    font: fontBold,
    color: colorRedText,
  });
  page.drawText(`ETB ${Number(totalCosts).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, {
    x: card2X + 12,
    y: currentY - 40,
    size: 15,
    font: fontBold,
    color: colorRedText,
  });

  currentY -= cardHeight + 10;

  // Card 3: Net Profit / Loss
  page.drawRectangle({
    x: leftX,
    y: currentY - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: isProfit ? rgb(0.94, 0.98, 1.0) : rgb(1.0, 0.95, 0.95),
    borderColor: isProfit ? rgb(0.75, 0.86, 0.99) : rgb(0.99, 0.79, 0.79),
    borderWidth: 1,
  });
  page.drawText(isProfit ? "NET SURPLUS (PROFIT)" : "NET DEFICIT (LOSS)", {
    x: leftX + 12,
    y: currentY - 18,
    size: 8.5,
    font: fontBold,
    color: isProfit ? rgb(0.11, 0.31, 0.85) : colorRedText,
  });
  page.drawText(`ETB ${Number(netProfitLoss).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, {
    x: leftX + 12,
    y: currentY - 40,
    size: 15,
    font: fontBold,
    color: isProfit ? rgb(0.11, 0.31, 0.85) : colorRedText,
  });

  // Card 4: Cost Limit
  page.drawRectangle({
    x: card2X,
    y: currentY - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: colorCardBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });
  page.drawText("ACTIVE BUDGET LIMIT", {
    x: card2X + 12,
    y: currentY - 18,
    size: 8.5,
    font: fontBold,
    color: colorMuted,
  });
  page.drawText(
    costLimit ? `ETB ${Number(costLimit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unbudgeted",
    {
      x: card2X + 12,
      y: currentY - 40,
      size: 15,
      font: fontBold,
      color: colorText,
    }
  );

  currentY -= cardHeight + 22;

  // --- 3. Key Financial Metrics Breakdown Table ---
  page.drawText("Executive Category & Budget Performance", {
    x: leftX,
    y: currentY,
    size: 11,
    font: fontBold,
    color: colorText,
  });

  currentY -= 12;

  const rows: { label: string; value: string; note?: string; color?: any }[] = [
    {
      label: "Total Gross Income Recorded",
      value: `ETB ${Number(totalIncome).toFixed(2)}`,
      color: colorGreenText,
    },
    {
      label: "Total Operational Expenditures",
      value: `ETB ${Number(totalCosts).toFixed(2)}`,
      color: colorRedText,
    },
    {
      label: isProfit ? "Net Operating Surplus" : "Net Operating Deficit",
      value: `ETB ${Number(netProfitLoss).toFixed(2)}`,
      color: isProfit ? colorGreenText : colorRedText,
    },
  ];

  if (costLimit) {
    const pct = ((totalCosts / costLimit) * 100).toFixed(1);
    rows.push({
      label: "Monthly Budget Plan Ceiling",
      value: `ETB ${Number(costLimit).toFixed(2)}`,
      note: `${pct}% used`,
      color: totalCosts > costLimit ? colorRedText : colorGreenText,
    });
  }

  if (basicCost !== undefined || fancyCost !== undefined || extraCost !== undefined) {
    if (basicCost !== undefined && basicCost > 0) {
      rows.push({
        label: "Category: Basic Expenses (Needs)",
        value: `ETB ${Number(basicCost).toFixed(2)}`,
        note: totalCosts > 0 ? `${((basicCost / totalCosts) * 100).toFixed(1)}% of total` : "",
      });
    }
    if (fancyCost !== undefined && fancyCost > 0) {
      rows.push({
        label: "Category: Fancy Expenses (Wants)",
        value: `ETB ${Number(fancyCost).toFixed(2)}`,
        note: totalCosts > 0 ? `${((fancyCost / totalCosts) * 100).toFixed(1)}% of total` : "",
      });
    }
    if (extraCost !== undefined && extraCost > 0) {
      rows.push({
        label: "Category: Extra Expenses (Savings / Luxuries)",
        value: `ETB ${Number(extraCost).toFixed(2)}`,
        note: totalCosts > 0 ? `${((extraCost / totalCosts) * 100).toFixed(1)}% of total` : "",
      });
    }
  }

  // Draw Table 1 Header
  const table1HeaderY = currentY - 10;
  page.drawRectangle({
    x: leftX,
    y: table1HeaderY - 8,
    width: contentWidth,
    height: 20,
    color: rgb(0.93, 0.95, 0.97),
  });

  page.drawText("METRIC / CATEGORY", {
    x: leftX + 10,
    y: table1HeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText("AMOUNT (ETB)", {
    x: rightX - 170,
    y: table1HeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText("SHARE / STATUS", {
    x: rightX - 75,
    y: table1HeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  currentY = table1HeaderY - 10;

  // Draw Rows for Table 1
  const rowHeight = 18;
  rows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      page.drawRectangle({
        x: leftX,
        y: currentY - rowHeight + 3,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.98, 0.99, 1.0),
      });
    }

    page.drawLine({
      start: { x: leftX, y: currentY - rowHeight + 3 },
      end: { x: rightX, y: currentY - rowHeight + 3 },
      color: colorBorder,
      thickness: 0.5,
    });

    page.drawText(row.label, {
      x: leftX + 10,
      y: currentY - 9,
      size: 8.5,
      font: fontRegular,
      color: colorText,
    });

    page.drawText(row.value, {
      x: rightX - 170,
      y: currentY - 9,
      size: 8.5,
      font: fontBold,
      color: row.color || colorText,
    });

    if (row.note) {
      page.drawText(row.note, {
        x: rightX - 75,
        y: currentY - 9,
        size: 7.5,
        font: fontRegular,
        color: colorMuted,
      });
    }

    currentY -= rowHeight;
  });

  currentY -= 20;

  // --- 4. Subcategory Costs Breakdown Section ---
  // Normalize subcategory input
  let normalizedSubcategories: SubcategoryCostItem[] = [];

  if (Array.isArray(subcategoryCosts)) {
    normalizedSubcategories = subcategoryCosts.map((item) => {
      const subKey = String(item.subcategory || "").toLowerCase();
      const cat = item.category || SUBCATEGORY_CATEGORY_MAP[subKey] || "basic";
      const displayLabel = item.label || SUBCATEGORY_DISPLAY_LABELS[subKey] || (subKey ? subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/_/g, " ") : "Other");
      const amt = Number(item.amount || 0);
      const pct = totalCosts > 0 ? (amt / totalCosts) * 100 : 0;
      return {
        subcategory: subKey,
        category: cat,
        amount: amt,
        label: displayLabel,
        percentage: pct,
      };
    });
  } else if (subcategoryCosts && typeof subcategoryCosts === "object") {
    normalizedSubcategories = Object.entries(subcategoryCosts).map(([key, value]) => {
      const subKey = String(key).toLowerCase();
      const cat = SUBCATEGORY_CATEGORY_MAP[subKey] || "basic";
      const displayLabel = SUBCATEGORY_DISPLAY_LABELS[subKey] || (subKey ? subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/_/g, " ") : "Other");
      const amt = Number(value || 0);
      const pct = totalCosts > 0 ? (amt / totalCosts) * 100 : 0;
      return {
        subcategory: subKey,
        category: cat,
        amount: amt,
        label: displayLabel,
        percentage: pct,
      };
    });
  }

  // Sort descending by highest spent amount
  normalizedSubcategories.sort((a, b) => b.amount - a.amount);

  // Helper to start a second page if content overflows
  const ensurePageSpace = (neededHeight: number): PDFPage => {
    if (currentY - neededHeight < footerY + 25) {
      page = pdfDoc.addPage([595.28, 841.89]);
      currentY = height - 50;

      // Small secondary header
      page.drawRectangle({
        x: leftX,
        y: currentY - 24,
        width: contentWidth,
        height: 28,
        color: rgb(0.98, 1.0, 0.98),
        borderColor: rgb(0.73, 0.92, 0.77),
        borderWidth: 1,
      });
      page.drawText("MC TRACKER — Detailed Subcategory Audit (Continued)", {
        x: leftX + 12,
        y: currentY - 14,
        size: 9.5,
        font: fontBold,
        color: colorPrimary,
      });
      currentY -= 40;
    }
    return page;
  };

  ensurePageSpace(60);

  page.drawText("Detailed Subcategory Expenditure Breakdown", {
    x: leftX,
    y: currentY,
    size: 11,
    font: fontBold,
    color: colorText,
  });

  currentY -= 12;

  // Subcategory Table Header
  const subHeaderY = currentY - 10;
  page.drawRectangle({
    x: leftX,
    y: subHeaderY - 8,
    width: contentWidth,
    height: 20,
    color: rgb(0.93, 0.95, 0.97),
  });

  page.drawText("SUBCATEGORY", {
    x: leftX + 10,
    y: subHeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText("CATEGORY", {
    x: leftX + 180,
    y: subHeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText("AMOUNT (ETB)", {
    x: rightX - 170,
    y: subHeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText("% SHARE", {
    x: rightX - 75,
    y: subHeaderY - 2,
    size: 8,
    font: fontBold,
    color: colorMuted,
  });

  currentY = subHeaderY - 10;

  if (normalizedSubcategories.length === 0) {
    // Empty state
    const subRowHeight = 22;
    page.drawText("No specific subcategory expenses logged during this period.", {
      x: leftX + 10,
      y: currentY - 11,
      size: 8.5,
      font: fontRegular,
      color: colorMuted,
    });
    currentY -= subRowHeight;
  } else {
    const subRowHeight = 18;

    normalizedSubcategories.forEach((item, idx) => {
      page = ensurePageSpace(subRowHeight + 5);

      const isEven = idx % 2 === 0;
      if (isEven) {
        page.drawRectangle({
          x: leftX,
          y: currentY - subRowHeight + 3,
          width: contentWidth,
          height: subRowHeight,
          color: rgb(0.98, 0.99, 1.0),
        });
      }

      page.drawLine({
        start: { x: leftX, y: currentY - subRowHeight + 3 },
        end: { x: rightX, y: currentY - subRowHeight + 3 },
        color: colorBorder,
        thickness: 0.5,
      });

      // Subcategory Name
      page.drawText(item.label || item.subcategory, {
        x: leftX + 10,
        y: currentY - 9,
        size: 8.5,
        font: fontBold,
        color: colorText,
      });

      // Category Pill / Badge
      const catName = String(item.category || "basic").toUpperCase();
      let catBg = rgb(0.92, 0.98, 0.94);
      let catColor = colorGreenText;

      if (catName === "FANCY") {
        catBg = rgb(0.95, 0.92, 1.0);
        catColor = rgb(0.48, 0.18, 0.85);
      } else if (catName === "EXTRA") {
        catBg = rgb(1.0, 0.95, 0.88);
        catColor = rgb(0.80, 0.38, 0.05);
      }

      const pillWidth = fontBold.widthOfTextAtSize(catName, 7) + 12;
      page.drawRectangle({
        x: leftX + 180,
        y: currentY - 12,
        width: pillWidth,
        height: 14,
        color: catBg,
      });

      page.drawText(catName, {
        x: leftX + 186,
        y: currentY - 8,
        size: 7,
        font: fontBold,
        color: catColor,
      });

      // Amount
      page.drawText(`ETB ${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, {
        x: rightX - 170,
        y: currentY - 9,
        size: 8.5,
        font: fontBold,
        color: colorRedText,
      });

      // Share Percentage
      const pctText = `${(item.percentage || 0).toFixed(1)}%`;
      page.drawText(pctText, {
        x: rightX - 75,
        y: currentY - 9,
        size: 8,
        font: fontRegular,
        color: colorMuted,
      });

      currentY -= subRowHeight;
    });
  }

  // --- 5. Draw Footers on All Pages ---
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);

    p.drawLine({
      start: { x: leftX, y: footerY + 16 },
      end: { x: rightX, y: footerY + 16 },
      color: colorBorder,
      thickness: 0.8,
    });

    p.drawText("Generated automatically by MC Tracker • Confidential Financial Document • All rights reserved © 2026", {
      x: leftX,
      y: footerY + 2,
      size: 7.5,
      font: fontRegular,
      color: colorMuted,
    });

    p.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: rightX - 45,
      y: footerY + 2,
      size: 7.5,
      font: fontRegular,
      color: colorMuted,
    });
  }

  return await pdfDoc.save();
}
