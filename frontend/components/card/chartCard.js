/**
 * Crée une carte contenant un graphique
 * @param {Object} config - Configuration de la carte
 * @param {string} config.title - Titre de la carte
 * @param {string} config.chartId - ID du canvas du graphique
 * @param {string} [config.chartType='line'] - Type de graphique (line, bar, pie, etc.)
 * @param {Object} [config.chartOptions] - Options du graphique
 * @param {Array} [config.chartData] - Données du graphique
 * @param {string} [config.containerClass] - Classes CSS supplémentaires pour le conteneur
 * @param {boolean} [config.withHeader=true] - Afficher l'en-tête avec le titre
 * @param {Function} [config.onInit] - Callback après initialisation du graphique
 * @returns {Object} { container: HTMLElement, chart: Chart }
 */
export function createChartCard(config) {
  // Configuration par défaut
  const {
    title = "Titre du graphique",
    chartId = `chart-${Math.random().toString(36).substr(2, 9)}`,
    chartType = "line",
    chartOptions = {},
    chartData = { labels: [], datasets: [] },
    containerClass = "",
    withHeader = true,
    onInit = null,
  } = config;

  // Création du conteneur principal
  const container = document.createElement("div");
  container.className = [
    "bg-white",
    "p-4",
    "rounded-lg",
    "shadow-sm",
    "border",
    "border-gray-100",
    "flex",
    "flex-col",
    containerClass,
  ].join(" ");

  // En-tête de la carte (optionnel)
  if (withHeader) {
    const header = document.createElement("div");
    header.className = "mb-4";

    const titleElement = document.createElement("h3");
    titleElement.className = "text-lg font-semibold text-gray-700";
    titleElement.textContent = title;

    header.appendChild(titleElement);
    container.appendChild(header);
  }

  // Conteneur du graphique
  const chartContainer = document.createElement("div");
  chartContainer.className = "flex-1 min-h-[250px] md:min-h-[300px]";

  // Canvas pour le graphique
  const canvas = document.createElement("canvas");
  canvas.id = chartId;
  canvas.setAttribute("aria-label", title);
  canvas.setAttribute("role", "img");

  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);

  // Initialisation du graphique
  let chart = null;

  // On attend que l'élément soit dans le DOM pour initialiser le graphique
  setTimeout(() => {
    const ctx = document.getElementById(chartId);
    if (ctx) {
      chart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          ...chartOptions,
        },
      });

      if (onInit) onInit(chart);
    }
  }, 0);

  return { container, chart };
}
