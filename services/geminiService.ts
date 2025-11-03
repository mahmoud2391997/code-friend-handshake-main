import { InvoiceData, ChatbotDataContext, RenewableData, RenewableCategory, DailyBriefingContext, PurchaseOrderSuggestionContext, SuggestedPurchaseOrderItem, FormulaSuggestionContext, NewProductIdeaContext, NewProductIdeaResponse, FormulaLine, Product } from '../types';

// NOTE: Direct AI API calls have been disabled in browser for security.
// All AI functions now return simulated data. To enable real AI:
// 1. Set up Lovable Cloud
// 2. Create edge functions for AI calls
// 3. Never expose API keys in browser code

export async function scanInvoiceWithGemini(base64Image: string, mimeType: string): Promise<InvoiceData> {
    // Simulate response (AI functionality requires edge function setup)
    console.log("Simulating invoice scan - setup Lovable Cloud for real AI");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                vendor: "Simulated Vendor Inc.",
                date: new Date().toISOString().split('T')[0],
                amount: 199.99,
            });
        }, 1500);
    });
}

export async function scanRenewableWithGemini(base64Image: string, mimeType: string): Promise<RenewableData> {
    console.log("Simulating renewable scan - setup Lovable Cloud for real AI");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                category: "Vehicle",
                name: "تسجيل مركبة (محاكاة)",
                identifier: "55-C-98765",
                issueDate: "2024-01-01",
                expiryDate: "2025-01-01",
            });
        }, 1500);
    });
}

export async function getSalesForecastWithGemini(
    historicalData: { month: string; totalSales: number }[]
): Promise<{ forecast: { month: string; predictedSales: number }[]; analysis: string; }> {
    
    console.log("Simulating sales forecast - setup Lovable Cloud for real AI");
    const lastMonth = historicalData.slice(-1)[0]?.month || '2024-07';
    const [year, month] = lastMonth.split('-').map(Number);
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
        const d = new Date(year, month - 1 + i, 1);
        const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        forecast.push({ month: nextMonth, predictedSales: Math.random() * 5000 + 15000 });
    }
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                forecast,
                analysis: "This is a simulated analysis. The sales trend appears positive, with seasonal peaks expected in the upcoming holiday season. Marketing efforts should focus on popular product categories to maximize revenue."
            });
        }, 2000);
    });
}

export async function getDailyBriefing(context: DailyBriefingContext): Promise<string> {
    console.log("Simulating daily briefing - setup Lovable Cloud for real AI");
    return new Promise(resolve => {
        setTimeout(() => {
            const briefing = `
### موجز الصباح لـ ${context.today} ☀️

**ملخص أداء الأمس:**
* **إجمالي المبيعات:** ${context.yesterdaySalesTotal.toLocaleString()} د.ك عبر ${context.yesterdayInvoiceCount} فاتورة.
* **المنتجات الأكثر مبيعاً:**
    * ${context.topSellingProducts[0]?.name || 'N/A'} (الكمية: ${context.topSellingProducts[0]?.quantity || 0})
    * ${context.topSellingProducts[1]?.name || 'N/A'} (الكمية: ${context.topSellingProducts[1]?.quantity || 0})

**تنبيهات هامة:**
* **مخزون منخفض:** يوجد **${context.lowStockItemsCount}** منتج وصل للحد الأدنى للمخزون. أهمها:
    * ${context.criticalLowStockItems[0]?.name || 'N/A'} (المتبقي: ${context.criticalLowStockItems[0]?.quantity || 0})
* **الموارد البشرية:** يوجد **${context.pendingHRRequests}** طلب معلق (إجازات، سلف، إلخ) بحاجة للمراجعة.
* **تجديدات قادمة:**
    * ${context.upcomingRenewals[0]?.name || 'N/A'} ينتهي خلال **${context.upcomingRenewals[0]?.daysUntilExpiry || 0}** يوم.

**اقتراح:**
* نظراً لأداء **${context.topSellingProducts[0]?.name || 'المنتج الأكثر مبيعاً'}** الجيد، قد يكون من الجيد التفكير في حملة تسويقية بسيطة له.
            `;
            resolve(briefing);
        }, 1500);
    });
}

export async function getChatbotResponse(query: string, context: ChatbotDataContext): Promise<string> {
    console.log("Simulating chatbot - setup Lovable Cloud for real AI");
    return new Promise(resolve => {
        setTimeout(() => {
            let responseText = "This is a simulated response. I can help with sales, inventory, and more.";
            if (query.toLowerCase().includes('sales')) {
                responseText = `The total sales amount is ${context.sales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()} KWD.`;
            } else if (query.toLowerCase().includes('low stock')) {
                const lowStockItems = context.inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0);
                responseText = `There are ${lowStockItems.length} items with low stock.`;
            }
            resolve(responseText);
        }, 1500);
    });
}

export async function getPurchaseOrderSuggestion(
  context: PurchaseOrderSuggestionContext
): Promise<SuggestedPurchaseOrderItem[]> {
  console.log("Simulating purchase order suggestion - setup Lovable Cloud for real AI");
  return new Promise(resolve => {
    setTimeout(() => {
      const suggestions = context.inventory
        .filter(item => item.currentStock < item.salesVelocityPerDay * context.forecastDays || (item.currentStock <= item.minStock && item.minStock > 0))
        .map(item => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          currentStock: item.currentStock,
          recommendedQuantity: Math.ceil(item.salesVelocityPerDay * context.forecastDays - item.currentStock + item.minStock) || 10,
          reasoning: "محاكاة: مخزون منخفض ومعدل مبيعات مرتفع."
        }))
        .filter(item => item.recommendedQuantity > 0)
        .slice(0, 5); // Limit for demo
      resolve(suggestions);
    }, 2000);
  });
}

export async function getFormulaSuggestion(context: FormulaSuggestionContext): Promise<FormulaLine[]> {
  console.log("Simulating formula suggestion - setup Lovable Cloud for real AI");
  return new Promise(resolve => {
    setTimeout(() => {
      const formula: FormulaLine[] = context.rawMaterials.slice(0, 3).map((material, index) => ({
        id: `formula-${index + 1}`,
        materialId: material.id,
        materialName: material.name,
        materialSku: material.sku,
        kind: "AROMA_OIL" as const,
        percentage: 10,
        density: 0.9,
      }));
      resolve(formula);
    }, 2000);
  });
}

export async function getNewProductIdea(context: NewProductIdeaContext): Promise<NewProductIdeaResponse> {
  console.log("Simulating product idea - setup Lovable Cloud for real AI");
  return new Promise(resolve => {
    setTimeout(() => {
      const idea: NewProductIdeaResponse = {
        productName: "عطر صيفي منعش (محاكاة)",
        fragranceNotes: {
          top: "حمضيات منعشة",
          middle: "ياسمين وزنبق",
          base: "خشب الصندل والمسك"
        },
        formula: context.rawMaterials.slice(0, 3).map((material, index) => ({
          id: `formula-${index + 1}`,
          materialId: material.id,
          materialName: material.name,
          materialSku: material.sku,
          kind: "AROMA_OIL" as const,
          percentage: 10,
          density: 0.9,
        })),
      };
      resolve(idea);
    }, 2000);
  });
}
