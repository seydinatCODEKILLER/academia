export const getActionsConfigAbsence = () => ({
  items: (item) => [
    {
      name: "absence",
      label: "Marquer absence",
      icon: "ri-user-unfollow-line",
      className: "text-neutral",
      showLabel: true,
      type: "direct",
    },
  ],
});

export const getActionsConfigClasses = () => ({
  type: "dropdown",
  items: (item) => [
    {
      name: "details",
      label: "Details",
      icon: "ri-arrow-go-back-line",
      className: "text-error",
      type: "direct",
      showLabel: true,
    },
  ],
});
