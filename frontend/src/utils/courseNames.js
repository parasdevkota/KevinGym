const NAME_MAP = {
  'C-001': 'Power Yoga',
  'C-002': 'Stretch & Restore',
  'C-003': 'Morning Spin',
  'C-004': 'Morning Meditation',
  'C-005': 'Core & Balance',
  'C-006': 'Vinyasa Flow',
  'C-007': 'Hot Yoga Basics',
  'C-008': 'Boxing Basics',
  'C-009': 'Dance Cardio',
  'C-010': 'Pilates Flow',
};

export const getCourseName = (classId, backendName) => {
  if (backendName) return backendName;
  return NAME_MAP[classId] || classId;
};
