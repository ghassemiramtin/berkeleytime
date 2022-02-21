import _ from "lodash";
import { Service, Inject } from "typedi";

import { SIS_Class_Section, CalAnswers_Grade } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

const parseArgs = (args) => {
  const newObject = {};
  _.each(args, (value, key) => {
    if (value !== undefined && key !== "CourseControlNbr") {
      newObject[key.replace(/___/g, ".")] = value;
    }
  });
  return newObject;
};

@Service()
export class SIS_Class_SectionService {
  constructor(
    @Inject(SIS_Class_Section.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class_Section>
  ) {}

  get = async (args) => {
    return await this.model.find({
      id: args.id,
      "class.session.term.name": RegExp(`^${args.year} ${args.semester}`),
    });
  };
}
