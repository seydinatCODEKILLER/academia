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

export async function renderOtherStatisqueData(professorId) {
  try {
    const chartsContainer = document.getElementById("charts1-container");

    // Nettoyer avant d'ajouter
    chartsContainer.innerHTML = "";

    // Ajouter un encart avec les stats globales
    const stats = await getAbsenteeismStats(professorId);
    const statsPanel = document.createElement("div");
    statsPanel.className = "bg-white p-4 rounded-lg mt-4";
    statsPanel.innerHTML = `
      <h3 class="font-bold mb-2">Statistiques globales</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat">
          <div class="stat-title">Taux d'absence moyen</div>
          <div class="stat-value text-error">${stats.globalStats.globalAbsenteeRate.toFixed(
            1
          )}%</div>
        </div>
        <div class="stat">
          <div class="stat-title">Total d'absences</div>
          <div class="stat-value">${stats.globalStats.totalAbsences}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Cours concernés</div>
          <div class="stat-value">${stats.globalStats.totalCourses}</div>
        </div>
      </div>
    `;
    chartsContainer.appendChild(statsPanel);
  } catch (error) {
    console.error(
      "Erreur lors du chargement du graphique d'absentéisme:",
      error
    );
    const chartsContainer = document.getElementById("charts1-container");
    chartsContainer.innerHTML = `
      <div class="alert alert-error">
        <i class="ri-alert-line"></i>
        Erreur lors du chargement des statistiques d'absentéisme
      </div>
    `;
  }
}
