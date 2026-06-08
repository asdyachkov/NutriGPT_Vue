import type { MealPlanDetailResponse, MealPlanRecipeResponse, MealType } from '@/types/api'
import { formatDate, formatDayOfWeek, formatDateShort, formatPrice, mealTypeLabels } from './formatters'

/**
 * Экспорт плана питания в PDF через нативный `window.print()`.
 *
 * Производственный подход: открывает новую вкладку со специальной «печатной»
 * версткой и сразу вызывает print(). Пользователь в диалоге браузера выбирает
 * «Сохранить как PDF» — получает многостраничный PDF-файл с кириллицей
 * и полным форматированием без необходимости бандлить шрифты.
 */
export function exportMealPlanPdf(plan: MealPlanDetailResponse, servings = 1): void {
  const html = buildPrintHtml(plan, servings)
  const win = window.open('', '_blank', 'width=900,height=1200')
  if (!win) {
    // Попап заблокирован — fallback: открываем в текущем окне через data URL
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Удалим через минуту, чтобы не копить blob URLs
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  // Печать после того как все ресурсы (шрифты, изображения) загрузятся
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
    }, 300)
  }
}

// ---------------------------------------------------------------------------
// HTML-генератор
// ---------------------------------------------------------------------------

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function buildPrintHtml(plan: MealPlanDetailResponse, servings: number): string {
  const title = escapeHtml(plan.title)
  const periodLine = `${formatDate(plan.start_date)} — ${formatDate(plan.end_date)}`
  const totalCost = plan.total_estimated_cost
    ? `<strong>${formatPrice(plan.total_estimated_cost)}</strong>${servings > 1 ? ` (≈ ${formatPrice(plan.total_estimated_cost / servings)} / чел)` : ''}`
    : '—'

  const daysHtml = (plan.days || []).map((day, idx) => {
    const mealsByType = groupByMeal(day.meals || [])
    const mealsHtml = MEAL_ORDER.map((type) => {
      const items = mealsByType.get(type) || []
      if (!items.length) return ''
      const rows = items
        .map((m) => `
          <tr>
            <td class="recipe">${escapeHtml(m.recipe_title)}</td>
            <td class="num">${Math.round(m.total_calories)}</td>
            <td class="num">${round1(m.total_protein)}</td>
            <td class="num">${round1(m.total_fat)}</td>
            <td class="num">${round1(m.total_carbs)}</td>
            <td class="num">${m.cooking_time_min}</td>
            <td class="num price">${m.estimated_cost != null ? formatPrice(m.estimated_cost) : '—'}</td>
          </tr>`)
        .join('')
      return `
        <div class="meal-section">
          <h4>${escapeHtml(mealTypeLabels[type] || type)}</h4>
          <table>
            <thead>
              <tr>
                <th>Блюдо</th>
                <th>ккал</th>
                <th>Б&nbsp;(г)</th>
                <th>Ж&nbsp;(г)</th>
                <th>У&nbsp;(г)</th>
                <th>Время, мин</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`
    }).join('')

    const dayCost = (day.meals || []).reduce((sum, m) => sum + (m.estimated_cost ?? 0), 0)

    return `
      <section class="day ${idx > 0 ? 'page-break' : ''}">
        <header class="day-header">
          <h2>День ${idx + 1} · ${escapeHtml(formatDayOfWeek(day.date))}</h2>
          <span class="day-date">${escapeHtml(formatDateShort(day.date))}</span>
        </header>
        <div class="day-summary">
          ${day.day_calories != null ? `<span><b>${Math.round(day.day_calories)}</b> ккал</span>` : ''}
          ${day.day_protein != null ? `<span>Б: <b>${Math.round(day.day_protein)}</b>&nbsp;г</span>` : ''}
          ${day.day_fat != null ? `<span>Ж: <b>${Math.round(day.day_fat)}</b>&nbsp;г</span>` : ''}
          ${day.day_carbs != null ? `<span>У: <b>${Math.round(day.day_carbs)}</b>&nbsp;г</span>` : ''}
          ${dayCost > 0 ? `<span class="cost">💰 ${escapeHtml(formatPrice(dayCost))}</span>` : ''}
        </div>
        ${mealsHtml}
      </section>`
  }).join('')

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1F2937;
      font-size: 12px;
      line-height: 1.5;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    header.doc-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      margin-bottom: 18px;
      border-bottom: 2px solid #1A6B4B;
    }
    .logo {
      width: 44px; height: 44px; border-radius: 10px;
      background: linear-gradient(135deg, #2D8B65, #E8A849);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 20px;
    }
    h1 { font-size: 22px; margin: 0 0 4px; color: #052E1C; }
    .doc-header__meta { color: #6B7280; font-size: 12px; }
    .summary {
      display: flex; gap: 18px; flex-wrap: wrap;
      margin: 10px 0 24px; padding: 12px 16px;
      background: #F0FDF6; border-radius: 10px;
      border: 1px solid rgba(26, 107, 75, 0.15);
      font-size: 12px;
    }
    .summary b { color: #1A6B4B; }

    section.day { break-inside: avoid; margin-bottom: 18px; }
    section.day.page-break { page-break-before: always; }
    .day-header {
      display: flex; align-items: baseline; gap: 12px;
      padding: 6px 0; border-bottom: 1px solid #E5E7EB;
      margin-bottom: 8px;
    }
    .day-header h2 {
      font-size: 14px; margin: 0; color: #052E1C;
      text-transform: capitalize;
    }
    .day-date { color: #9CA3AF; font-size: 11px; }
    .day-summary {
      display: flex; gap: 14px; flex-wrap: wrap;
      font-size: 11px; color: #374151;
      margin-bottom: 10px;
    }
    .day-summary b { color: #111827; }
    .day-summary .cost { color: #1A6B4B; font-weight: 600; }

    .meal-section { margin-bottom: 10px; break-inside: avoid; }
    .meal-section h4 {
      font-size: 12px; font-weight: 700; color: #1A6B4B;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin: 8px 0 4px;
    }
    table {
      width: 100%; border-collapse: collapse;
      font-size: 11px;
    }
    thead th {
      background: #F1F3F5; color: #4B5563;
      font-weight: 600;
      padding: 5px 8px; text-align: left;
      border-bottom: 1px solid #E5E7EB;
      white-space: nowrap;
    }
    td { padding: 5px 8px; border-bottom: 1px solid #F1F3F5; }
    td.num { text-align: right; white-space: nowrap; color: #374151; }
    td.recipe { font-weight: 500; color: #111827; }
    td.price { color: #1A6B4B; font-weight: 600; }

    footer.doc-footer {
      margin-top: 18px; padding-top: 8px;
      border-top: 1px solid #E5E7EB;
      font-size: 10px; color: #9CA3AF; text-align: center;
    }

    @media print {
      .summary { background: #F0FDF6 !important; }
      thead th { background: #F1F3F5 !important; }
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div class="logo">N</div>
    <div>
      <h1>${title}</h1>
      <div class="doc-header__meta">${escapeHtml(periodLine)} · Дней: ${plan.days?.length || 0}</div>
    </div>
  </header>

  <div class="summary">
    <span>Период: <b>${escapeHtml(periodLine)}</b></span>
    <span>Суммарная стоимость: ${totalCost}</span>
    ${servings > 1 ? `<span>Порций на блюдо: <b>${servings}</b></span>` : ''}
  </div>

  ${daysHtml}

  <footer class="doc-footer">
    Сгенерировано NutriGPT · ${formatDate(new Date().toISOString().slice(0, 10))}
  </footer>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByMeal(meals: MealPlanRecipeResponse[]): Map<string, MealPlanRecipeResponse[]> {
  const map = new Map<string, MealPlanRecipeResponse[]>()
  for (const m of meals) {
    const arr = map.get(m.meal_type) || []
    arr.push(m)
    map.set(m.meal_type, arr)
  }
  // Сортировка по sort_order внутри каждого типа
  for (const [k, v] of map) {
    map.set(k, v.sort((a, b) => a.sort_order - b.sort_order))
  }
  return map
}

function round1(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1)
}

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
