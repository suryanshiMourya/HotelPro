const indianCities = require("../data/indianCities");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/locations/cities?q=ind&state=Madhya%20Pradesh
const getCities = (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const state = typeof req.query.state === "string" ? req.query.state.trim() : "";

    let results = indianCities;

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      results = results.filter((item) => regex.test(item.city));
    }

    if (state) {
      const regex = new RegExp(`^${escapeRegex(state)}$`, "i");
      results = results.filter((item) => regex.test(item.state));
    }

    return res.status(200).json({
      count: results.length,
      cities: results
    });
  } catch (error) {
    console.error("Get cities error:", error.message);
    return res.status(500).json({ message: "Failed to fetch cities" });
  }
};

// GET /api/locations/states
const getStates = (req, res) => {
  try {
    const states = [...new Set(indianCities.map((item) => item.state))].sort();
    return res.status(200).json({ count: states.length, states });
  } catch (error) {
    console.error("Get states error:", error.message);
    return res.status(500).json({ message: "Failed to fetch states" });
  }
};

module.exports = { getCities, getStates };
