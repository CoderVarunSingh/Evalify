const Problem = require('../models/Problem');

// GET /api/problems - retrieve all problems
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.json(problems);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/problems/:id - retrieve a single problem by ID
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    console.error('Error fetching problem by id:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
