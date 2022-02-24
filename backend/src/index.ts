import "#src/env";

import axios from "axios";
import cors from "cors";
import events from "events";
import express from "express";
import "express-async-errors";
import { Server as HttpServer } from "http";
import passport from "passport";
import "reflect-metadata";

import apollo from "#src/apollo";
import { URL_DOMAIN } from "#src/config";
import { PORT_EXPRESS } from "#src/config";
import {
  calanswers_grades,
  sis_class_sections,
  sis_classes,
  sis_courses,
  users,
} from "#src/routes/_index";
import "#src/services/gcloud";
import "#src/services/mongodb";
import "#src/services/passport";

events.defaultMaxListeners = 200;
axios.defaults.headers["Accept"] = "application/json";

const app = express();
app.use(express.urlencoded({ extended: true }) as express.RequestHandler);
app.use(passport.initialize());
if (process.env.NODE_ENV == "prod") {
  app.use(
    cors({
      origin: URL_DOMAIN,
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

const http = new HttpServer(app);
const apiRouter = express.Router();

app.use("/api", apiRouter);
apiRouter.use("/calanswers_grades", calanswers_grades);
apiRouter.use("/sis_class_sections", sis_class_sections);
apiRouter.use("/sis_classes", sis_classes);
apiRouter.use("/sis_courses", sis_courses);
apiRouter.use("/users", users);
http.listen(PORT_EXPRESS, () => {
  console.info(`Server now listening on port ${PORT_EXPRESS}`);
});

await apollo(app);
apiRouter.use((err: any, {}, res: express.Response, {}) => {
  console.error(err);
  return res.status(500).json({ error: err.stack });
});

// uncomment if interested in seeing full MongoDB interactions printed to console
/*
mongoose.set("debug", function (collectionName, method, query, doc) {
  console.debug(
    "Mongoose: ".cyan +
      `${collectionName}.${method} (${JSON.stringify(query, null, 2)})`
  );
});
*/

// prints out all found fields for models
// note that because of SIS API weirdness, not ALL fields will be non-null for any document instan
// await import("#src/helpers/schemaWalker");