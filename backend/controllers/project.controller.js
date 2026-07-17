const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // HARDCODED FOR SOLO TESTING: No middleware needed right now
    const temporaryUserId = "64a1b2c3d4e5f6a7b8c9d0e1"; 

    const newProject = new Project({
      name,
      description,
      owner: temporaryUserId, 
      members: [temporaryUserId] 
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};