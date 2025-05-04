import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import { getCurrentWeekNumber } from "../../utils/function.js";

function createCalendarHeader(config) {
  const header = document.createElement("div");
  header.className = "p-4 border-b flex justify-between items-center bg-white";

  const titleContainer = document.createElement("div");
  titleContainer.className = "flex-1 min-w-0"; // Empêche le débordement

  const title = document.createElement("h3");
  title.className = "text-lg font-bold truncate"; // Ajout de truncate
  title.textContent = `Emploi du temps - Semaine ${
    getCurrentWeekNumber() + config.currentWeek
  }`;
  titleContainer.appendChild(title);

  const controls = document.createElement("div");
  controls.className = "flex gap-2 shrink-0"; // Empêche le rétrécissement

  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-sm btn-ghost";
  prevBtn.innerHTML = '<i class="ri-arrow-left-line"></i> Précédente';

  const todayBtn = document.createElement("button");
  todayBtn.className = "btn btn-sm btn-soft btn-primary";
  todayBtn.textContent = "Aujourd'hui";

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-sm btn-ghost";
  nextBtn.innerHTML = 'Suivante <i class="ri-arrow-right-line"></i>';

  controls.append(prevBtn, todayBtn, nextBtn);
  header.append(titleContainer, controls);

  return header;
}

function createCourseCard(course, onDetails) {
  const card = document.createElement("div");
  card.className = `bg-primary text-primary-content rounded p-2 mb-1 cursor-pointer 
    hover:bg-primary-focus transition-all duration-200 hover:-translate-y-0.5 
    hover:shadow-sm`;
  card.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="ri-book-2-line"></i>
      <span class="font-bold truncate">${course.module}</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
    <div class="text-sm"><i class="ri-verified-badge-line"></i> ${course.statut}</div>
    <div class="text-sm font-medium"><i class="ri-projector-line"></i> ${course.classRoom}</div>
    </div>
  `;
  card.onclick = () => onDetails(course);
  return card;
}

function createCalendarBody(config, courses) {
  const body = document.createElement("div");
  body.className = "overflow-auto";

  const grid = document.createElement("div");
  grid.className = "grid min-w-[800px] w-full"; // Ajout de w-full
  grid.style.gridTemplateColumns = `100px repeat(${config.days.length}, 1fr)`;

  // En-tête des jours
  const daysHeader = document.createElement("div");
  daysHeader.className = "col-span-full grid grid-cols-7 bg-base-200"; // Position sticky
  daysHeader.style.gridColumn = "1 / -1";

  const cornerCell = document.createElement("div");
  cornerCell.className = "p-2 border-r border-b border-base-300";
  daysHeader.appendChild(cornerCell);

  config.days.forEach((day) => {
    const dayCell = document.createElement("div");
    dayCell.className =
      "p-2 text-center font-bold border-r border-b border-base-300 truncate";
    dayCell.textContent = day;
    daysHeader.appendChild(dayCell);
  });

  grid.appendChild(daysHeader);

  // Lignes d'heures
  for (
    let hour = config.startHour;
    hour < config.endHour;
    hour += config.hourStep
  ) {
    const timeSlot = document.createElement("div");
    timeSlot.className = "contents";

    const timeCell = document.createElement("div");
    timeCell.className =
      "p-2 text-right border-r border-b border-base-300 bg-base-100 sticky left-0 z-5"; // Position sticky
    timeCell.textContent = `${hour}h-${hour + config.hourStep}h`;
    timeSlot.appendChild(timeCell);

    config.days.forEach((day, dayIndex) => {
      const dayCell = document.createElement("div");
      dayCell.className =
        "p-1 border-r border-b border-base-300 relative min-h-[80px] bg-white";

      courses
        .filter(
          (course) =>
            course.day === dayIndex &&
            course.startHour <= hour &&
            course.endHour >= hour + config.hourStep
        )
        .forEach((course) => {
          dayCell.appendChild(
            createCourseCard(course, config.onDetails || console.log)
          );
        });

      timeSlot.appendChild(dayCell);
    });

    grid.appendChild(timeSlot);
  }

  body.appendChild(grid);
  return body;
}

export function createCourseCalendar(initialCourses = [], options = {}) {
  const config = {
    startHour: 8,
    endHour: 20,
    hourStep: 1,
    days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    currentWeek: 0,
    fetchData: null,
    onDetails: null,
    ...options,
  };

  const calendar = document.createElement("div");
  calendar.className =
    "bg-white rounded-lg shadow overflow-hidden h-[80vh] flex flex-col";

  // Header - rendu une seule fois
  const header = createCalendarHeader(config);
  calendar.appendChild(header);

  // Body - conteneur principal qui sera mis à jour
  const bodyContainer = document.createElement("div");
  bodyContainer.className = "flex-1 overflow-hidden relative";

  // Body initial
  const initialBody = createCalendarBody(config, initialCourses);
  bodyContainer.appendChild(initialBody);
  calendar.appendChild(bodyContainer);

  // Navigation si fetchData est fourni
  if (config.fetchData) {
    setupCalendarNavigation(calendar, bodyContainer, config);
  }

  return calendar;

  function setupCalendarNavigation(calendarElement, bodyContainer, config) {
    let currentWeekOffset = config.currentWeek;

    const updateWeek = async (offset) => {
      const loading = showLoadingModal("Chargement de la semaine...");
      try {
        const courses = await config.fetchData(offset);

        // Mettre à jour le titre
        const title = calendarElement.querySelector("h3");
        if (title) {
          title.textContent = `Emploi du temps - Semaine ${
            getCurrentWeekNumber() + offset
          }`;
        }

        // Remplacer le corps
        bodyContainer.innerHTML = "";
        const newBody = createCalendarBody(
          { ...config, currentWeek: offset },
          courses
        );
        bodyContainer.appendChild(newBody);
      } catch (error) {
        console.error("Erreur de mise à jour:", error);
        bodyContainer.innerHTML = `
          <div class="alert alert-error m-4">
            <i class="ri-error-warning-line"></i>
            <span>Erreur de chargement: ${error.message}</span>
          </div>
        `;
      } finally {
        loading.close();
      }
    };

    // Gestionnaires d'événements
    const bindNavigation = () => {
      const prevBtn = calendarElement.querySelector("button:first-of-type");
      const todayBtn = calendarElement.querySelector("button:nth-of-type(2)");
      const nextBtn = calendarElement.querySelector("button:last-of-type");

      if (prevBtn) {
        prevBtn.onclick = async () => {
          currentWeekOffset -= 1;
          await updateWeek(currentWeekOffset);
        };
      }

      if (todayBtn) {
        todayBtn.onclick = async () => {
          currentWeekOffset = 0;
          await updateWeek(currentWeekOffset);
        };
      }

      if (nextBtn) {
        nextBtn.onclick = async () => {
          currentWeekOffset += 1;
          await updateWeek(currentWeekOffset);
        };
      }
    };

    // Initial bind
    bindNavigation();
  }
}
