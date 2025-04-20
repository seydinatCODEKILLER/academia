import { createRpStatsCard } from "../../components/card/card.js";
import { createChartCard } from "../../components/card/chartCard.js";
import {
  getClassStatistics,
  getCoursesByTrackData,
  getCoursesEvolution,
  getCourseStatistics,
  getProfessorStatistics,
} from "../../services/statistiqueService.js";

export async function renderRpStatsCards() {
  const container = document.createElement("div");
  container.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5";
  const [statisticProfessor, statistiCourse, statistiClasse] =
    await Promise.all([
      await getProfessorStatistics(),
      await getCourseStatistics(),
      await getClassStatistics(),
    ]);
  const { totalClasses, archivedClasses, availableClasses } = statistiClasse;
  const { totalCours, plannedCours, canceledCours } = statistiCourse;
  const { totalProfesseurs, activeProfesseurs, avalaibleProfesseurs } =
    statisticProfessor;

  const classCard = createRpStatsCard({
    title: "Statistiques des Classes",
    value: totalClasses,
    icon: "ri-presentation-line",
    totalData: totalClasses,
    archivedData: archivedClasses,
    availableData: availableClasses,
    trend: "up",
    key: "classes",
  });

  const professeursCard = createRpStatsCard({
    title: "Statistiques des professeurs",
    value: totalProfesseurs,
    icon: "ri-screenshot-line",
    totalData: totalProfesseurs,
    archivedData: activeProfesseurs,
    availableData: avalaibleProfesseurs,
    trend: "up",
    key: "professeurs",
  });

  const coursCard = createRpStatsCard({
    title: "Statistiques des cours",
    value: totalCours,
    icon: "ri-chat-smile-ai-line",
    totalData: totalCours,
    availableData: plannedCours,
    archivedData: canceledCours,
    trend: "up",
    key: "cours",
  });

  container.appendChild(classCard);
  container.appendChild(professeursCard);
  container.appendChild(coursCard);
  document.getElementById("stats-section").appendChild(container);
}
/**
 * Crée un graphique d'évolution des cours
 * @returns {Promise<Object>} { container: HTMLElement, chart: Chart }
 */
export async function createCoursesEvolutionChart() {
  // Récupérer les données
  const { labels, data } = await getCoursesEvolution();

  // Configuration du graphique
  const chartConfig = {
    title: "Évolution des cours par mois",
    chartId: "courses-evolution-chart",
    chartType: "line",
    chartData: {
      labels: labels,
      datasets: [
        {
          label: "Nombre de cours",
          data: data,
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    chartOptions: {
      plugins: {
        title: {
          display: true,
          text: "Évolution mensuelle des cours programmés",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Nombre de cours",
          },
        },
        x: {
          title: {
            display: true,
            text: "Mois",
          },
        },
      },
    },
  };

  // Créer et retourner la carte avec le graphique
  return createChartCard(chartConfig);
}

export async function renderCourseChart() {
  try {
    const { container } = await createCoursesEvolutionChart();
    document.getElementById("charts-container").appendChild(container);
  } catch (error) {
    console.error("Erreur lors du chargement du graphique:", error);
  }
}

/**
 * Crée une carte avec graphique des cours par filière
 * @param {Object} data - Données formatées { labels, datasets }
 * @returns {Object} { container: HTMLElement, chart: Chart }
 */
export function createCoursesByTrackChart({ labels, datasets }) {
  // Amélioration des datasets avec des styles plus riches
  const enhancedDatasets = datasets.map((dataset) => ({
    ...dataset,
    borderWidth: 3,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: dataset.borderColor,
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
    fill: true,
    backgroundColor: dataset.borderColor.replace(")", ", 0.05)"),
    tension: 0.4, // Courbe plus douce
  }));

  return createChartCard({
    title: "Évolution des cours par filière",
    chartType: "bar",
    chartData: { labels, datasets: enhancedDatasets },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Évolution mensuelle des cours par filière",
          font: {
            size: 18,
            weight: "600",
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          padding: { top: 10, bottom: 20 },
        },
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 16,
            padding: 20,
            font: {
              size: 12,
              weight: "500",
            },
            usePointStyle: true,
            pointStyle: "circle",
          },
          align: "center",
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.8)",
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#718096",
            font: {
              weight: "500",
            },
          },
          title: {
            display: true,
            text: "Mois",
            color: "#4a5568",
            font: {
              size: 14,
              weight: "600",
            },
            padding: { top: 10 },
          },
        },
        y: {
          grid: {
            color: "rgba(160, 174, 192, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "#718096",
            padding: 10,
          },
          title: {
            display: true,
            text: "Nombre de cours",
            color: "#4a5568",
            font: {
              size: 14,
              weight: "600",
            },
            padding: { bottom: 10 },
          },
          beginAtZero: true,
        },
      },
      elements: {
        line: {
          cubicInterpolationMode: "monotone", // Lignes plus fluides
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  });
}

export async function renderCourseByTrackChart() {
  try {
    const { labels, datasets } = await getCoursesByTrackData();
    const { container } = createCoursesByTrackChart({ labels, datasets });
    document.getElementById("charts1-container").appendChild(container);
  } catch (error) {
    console.error("Erreur lors du chargement du graphique:", error);
  }
}
