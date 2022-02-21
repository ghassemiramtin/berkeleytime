// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/blob/9b6d4ba96e7f6be80d39d28bbb0aaba7670d04e5/apps/api/src/app/loaders/dependencyInjector.ts
import {
  CalAnswers_GradeResolver,
  SIS_ClassResolver,
  SIS_Class_SectionResolver,
  SIS_CourseResolver,
  UserResolver,
} from "#src/graphql/resolvers/_index";
import {
  CalAnswers_Grade,
  SIS_Class,
  SIS_Class_Section,
  SIS_Course,
  User,
} from "#src/models/_index";

export const dependencyInjection = (Container) => {
  const entities = [
    CalAnswers_Grade,
    SIS_Class,
    SIS_Class_Section,
    SIS_Course,
    User,
  ];
  try {
    for (let entity of entities) {
      Container.set(entity.collection.collectionName, entity);
    }
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

export const resolvers: any = [
  CalAnswers_GradeResolver,
  SIS_ClassResolver,
  SIS_Class_SectionResolver,
  SIS_CourseResolver,
  UserResolver,
];
