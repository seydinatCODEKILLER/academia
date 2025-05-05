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
