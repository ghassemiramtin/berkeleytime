import { createHash } from "crypto";
import _ from "lodash";
import mongoose from "mongoose";

import { EXPIRE_TIME_REDIS_KEY, URL_MDB } from "#src/config";
import { redisClient } from "#src/services/redis";

const originalExec = mongoose.Query.prototype.exec;

export interface IMongooseCacheOptions {
  ttl?: number;
  key?: string;
  flag?: boolean | string;
  ttlExtend?: boolean;
}

mongoose.pluralize(null);
await mongoose.connect(URL_MDB);
console.info(
  `*** MongoDB successfully connected at ${mongoose.connection.host} ***`
);

if (process.env.NODE_ENV != "prod") {
  await import("@colors/colors");
}

// Mongoose + Redis caching
// https://github.com/evsar3/mongoose-ultimate-redis-cache/blob/8068a114b634d09c89e0c2b8f376e03b6b3801c0/src/index.ts

mongoose.Query.prototype["cache"] = function (
  options?: IMongooseCacheOptions | number
): mongoose.Query<any, any> {
  this._cacheEnabled = true;
  this._key = null;
  this._ttl = EXPIRE_TIME_REDIS_KEY;
  if (typeof options === "number") {
    this._ttl = options;
  } else if (options !== undefined) {
    this._key = options.key;
    this._ttl = options.ttl ?? EXPIRE_TIME_REDIS_KEY;
    this._ttlExtend = options.ttlExtend;
    this._flag =
      typeof options.flag === "boolean"
        ? options.flag
          ? "cache"
          : undefined
        : options.flag;
  }
  return this;
};
mongoose.Query.prototype.exec = async function (): Promise<
  mongoose.QueryCursor<mongoose.Document>
> {
  if (this._cacheEnabled !== true) {
    return originalExec.apply(this, arguments);
  }
  const key =
    this._key ??
    createHash("md5").update(JSON.stringify(this.getQuery())).digest("hex");
  const cachedResult = await redisClient.get(key);
  if (cachedResult) {
    if (process.env.NODE_ENV == "dev") {
      console.info(`cache hit (${key}): ${JSON.stringify(this.getQuery())}`);
    }
    const result = JSON.parse(cachedResult);
    if (this._ttlExtend === true) {
      redisClient.set(key, cachedResult, { EX: this._ttl });
    }
    let models: any = [];
    if (Array.isArray(result)) {
      if (result.some((doc) => doc._id)) {
        result.forEach((item) => {
          const model = new this.model(item);
          model[this._flag] = true;
          models.push(model);
        });
      } else {
        models = result;
      }
    } else {
      const model = new this.model(result);
      model[this._flag] = true;
      models = model;
    }
    return models;
  }
  const result = await originalExec.apply(this, arguments);
  if (result) {
    console.info(`cache set (${key}): ${JSON.stringify(this.getQuery())}`);
    redisClient.set(key, JSON.stringify(result), { EX: this._ttl });
  }
  return result;
};
mongoose.Model["purgeCacheKey"] = (key: string) => redisClient.del(key);
