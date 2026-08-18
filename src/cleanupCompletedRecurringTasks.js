/**
 * @param {(task: GoogleAppsScript.Tasks.Schema.Task & { taskListId: string }, taskIdx: number) => boolean} filter
 */
const getTasksWith = (filter) => {
  return Tasks?.Tasklists.list()
    .items?.flatMap(({ id: taskListId }) => {
      if (!taskListId) return [];
      return (
        Tasks?.Tasks.list(taskListId, { showHidden: true }).items?.map((task) => ({
          ...task,
          taskListId,
        })) || []
      );
    })
    .filter(filter);
};

const cleanupCompletedRecurringTasks = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  getTasksWith(({ status, due }) => status === "completed" && new Date(due) < yesterday).forEach(
    (task) => {
      if (!task.id) return;
      Logger.log(`Removing task:\n${JSON.stringify(task)}`);
      Tasks?.Tasks.remove(task.taskListId, task.id);
    },
  );
};
