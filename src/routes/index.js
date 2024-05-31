const fs = require("fs");
const path = require("path");

const { userAuthRoutes } = require("./paths");

const loadAppRoutes = (app) => {
  const loadRoutes = (baseRoute, routesPath) => {
    const files = fs.readdirSync(routesPath).sort();
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const routePath = path.join(routesPath, file);
        const route = require(routePath);
        const routeName = file.replace(".js", "");
        // console.log(`path --> http://localhost:8000/${baseRoute}/${routeName}`);
        baseRoute?.length >= 1
          ? app.use(`/${baseRoute}/${routeName}`, route)
          : app.use(`/${routeName}`, route);
      }
    });
  };
  // routes
  loadRoutes("user", userAuthRoutes);
};

module.exports = { loadAppRoutes };
