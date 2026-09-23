const getDashboardOverview = async (
  req,
  res,
  next
) => {
  try {
    res.status(200).json({
      success: true,

      message:
        "Dashboard overview loaded successfully",

      overview: {
        businesses: 0,
        leads: 0,
        activeProjects: 0,
        proposals: 0,
        invoices: 0,
        revenue: 0,
      },

      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};