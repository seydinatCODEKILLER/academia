import { createChartCard } from "../../components/card/chartCard.js";
import { getAbsenteeismStats } from "../../services/professeurService.js";

export async function createAbsenteeismChart(professorId) {
  // Récupérer les données avec l'ID du professeur
  const { labels, presenceData, absenceData, globalStats } =
    await getAbsenteeismStats(professorId);

  // Configuration du graphique
  const chartConfig = {
    title: `Taux d'absentéisme`,
    chartId: "absenteeism-chart",
    chartType: "bar",
    chartData: {
      labels: labels,
      datasets: [
        {
          label: "Taux de présence",
          data: presenceData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Taux d'absence",
          data: absenceData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    chartOptions: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Taux global d'absentéisme: ${globalStats.globalAbsenteeRate.toFixed(
            1
          )}% | ${globalStats.totalAbsences} absences sur ${
            globalStats.totalCourses
          } cours`,
          font: {
            size: 14,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}%`;
            },
            footer: (context) => {
              const course = globalStats.rawData[context[0].dataIndex];
              return [
                `Cours: ${course.courseName}`,
                `Date: ${course.date}`,
                `Heure: ${course.heure}`,
                `Étudiants: ${course.totalStudents} (Absents: ${course.absentCount})`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Cours (top 10 par taux d'absence)",
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Pourcentage (%)",
          },
          ticks: {
            callback: function (value) {
              return `${value}%`;
            },
          },
        },
      },
    },
  };

  return createChartCard(chartConfig);
}

export async function renderAbsenteeismChart(professorId) {
  try {
    const { container } = await createAbsenteeismChart(professorId);
    const chartsContainer = document.getElementById("charts-container");

    chartsContainer.innerHTML = "";
    chartsContainer.appendChild(container);
  } catch (error) {
    console.error(
      "Erreur lors du chargement du graphique d'absentéisme:",
      error
    );
    const chartsContainer = document.getElementById("charts-container");
    chartsContainer.innerHTML = `
      <div class="alert alert-error">
        <i class="ri-alert-line"></i>
        Erreur lors du chargement des statistiques d'absentéisme
      </div>
    `;
  }
}

const createStatItem = (title, value, isError = false) => {
  const statDiv = document.createElement("div");
  statDiv.className = "stat";

  statDiv.innerHTML = `
    <div class="stat-title">${title}</div>
    <div class="stat-value ${isError ? "text-error" : ""}">${value}</div>
  `;

  return statDiv;
};

const createStatsPanel = (stats) => {
  const panel = document.createElement("div");
  panel.className = "bg-white p-4 rounded-lg mt-4";

  const title = document.createElement("h3");
  title.className = "font-bold mb-2";
  title.textContent = "Statistiques globales";
  panel.appendChild(title);

  const statsGrid = document.createElement("div");
  statsGrid.className = "grid grid-cols-1 md:grid-cols-3 gap-4";

  // Ajout des statistiques
  statsGrid.appendChild(
    createStatItem(
      "Taux d'absence moyen",
      `${stats.globalAbsenteeRate.toFixed(1)}%`,
      true
    )
  );

  statsGrid.appendChild(
    createStatItem("Total d'absences", stats.totalAbsences)
  );

  statsGrid.appendChild(createStatItem("Cours concernés", stats.totalCourses));

  panel.appendChild(statsGrid);
  return panel;
};

const showStatisticsError = () => {
  const container = document.getElementById("charts1-container");
  container.innerHTML = `
    <div class="alert alert-error">
      <i class="ri-alert-line"></i>
      Erreur lors du chargement des statistiques d'absentéisme
    </div>
  `;
};

export const renderProfessorStatistics = async (professorId) => {
  const container = document.getElementById("charts1-container");
  container.innerHTML = "";

  try {
    const stats = await getAbsenteeismStats(professorId);
    container.appendChild(createStatsPanel(stats.globalStats));
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    showStatisticsError();
  }
};
