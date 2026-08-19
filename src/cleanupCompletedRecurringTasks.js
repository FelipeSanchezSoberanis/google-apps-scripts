/**
 * @param {Object} arg0
 * @param {(task: GoogleAppsScript.Tasks.Schema.Task & { taskListId: string }, taskIdx: number) => boolean} arg0.filter
 * @param {Object} arg0.options
 */
const getTasksWith = ({ filter, options }) => {
  return Tasks?.Tasklists.list()
    .items?.flatMap(({ id: taskListId }) => {
      if (!taskListId) return [];
      return (
        Tasks?.Tasks.list(taskListId, options).items?.map((task) => ({
          ...task,
          taskListId,
        })) || []
      );
    })
    .filter(filter);
};

const cleanupCompletedRecurringTasks = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  getTasksWith({
    options: { showHidden: true, dueMax: tomorrow.toISOString(), maxResults: 100 },
    filter: ({ status, due }) => status === "completed" && new Date(due) < yesterday,
  }).forEach((task) => {
    if (!task.id) return;
    Logger.log(`Removing task:\n${JSON.stringify(task)}`);
    Tasks?.Tasks.remove(task.taskListId, task.id);
  });
};
