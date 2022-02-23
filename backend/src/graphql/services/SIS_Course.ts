import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class, SIS_Course } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

const parseArgs = (args) => {
  const newObject = {};
  _.each(args, (value, key) => {
    if (value !== undefined) {
      newObject[key.replace(/___/g, ".")] = value;
    }
  });
  return newObject;
};

@Service()
class service {
  constructor(
    @Inject(SIS_Course.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Course>
  ) {}

  get = async (id: Promise<typeof SIS_Course>) => {
    return await this.model.findOne({ _id: id });
  };

  getClasses = async (courseId) => {
    return await SIS_Class.find({
      "course.identifiers.id": courseId,
    });
  };

  getCourses = async (args, fieldsProjection) => {
    return _.chain(
      await this.model.find(
        {
          "status.code": "ACTIVE",
          ...parseArgs(args),
        },
        {
          "identifiers.id": 1,
          "identifiers.type": 1,
          "subjectArea.code": 1,
          "catalogNumber.number": 1,
          ...fieldsProjection,
        }
      )
    )
      .orderBy((o) => parseInt(o.catalogNumber.number))
      .orderBy("subjectArea.code");
  };
  getSubjects = async () => {
    return await this.model.distinct("subjectArea.description", {
      "status.code": "ACTIVE",
    });
  };
}

Container.set(SIS_Course.collection.collectionName, SIS_Course);
export const SIS_CourseService = Container.get(service);
