import { access, readFileSync } from 'fs';
import * as joi from 'joi';
import { load } from 'js-yaml';

export interface Configuration {
  port: number;
  isProd: boolean;
  prefix: string;
  version: string;
  frontendUrl: string;
  grpcUrl: string;
  verificationPath: {
    register: string;
    resetPassword: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    database: number;
    prefix: string;
  };
  redisLock: {
    driftFactor: number;
    retryJitter: number;
    retryCount: number;
    retryDelay: number;
  };
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  agenda: {
    uri: string;
    collection: string;
    database: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    from: string;
  };
  verificationExpiresIn: {
    register: number;
    resetPassword: number;
  };
  jwt: {
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
  };
  mongo: {
    uri: string;
    username: string;
    password: string;
    port: number;
    database: string;
  };
  kafka: {
    brokers: string[];
    groupId: string;
    topics: {
      name: string;
      partitions: number;
      replicationFactor: number;
    }[];
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3: {
      bucket: string;
      url: string;
    };
    ses: {
      from: string;
    };
  };
  services: Record<
    string,
    { prefix: string; version: string; container_name: string; port: string }
  >;
  stream: {
    api_key: string;
    secret_key: string;
  };
}

const grpcUrlSchema = joi.string().required();

const servicesSchema = joi.object().pattern(
  joi.string(),
  joi.object({
    prefix: joi.string().required(),
    version: joi.string().required(),
    container_name: joi.string().required(),
    port: joi.string().required(),
  }),
);

const configSchema = joi.object<Configuration>({
  port: joi.number().required(),
  isProd: joi.boolean().required(),
  prefix: joi.string().required(),
  version: joi.string().required(),
  frontendUrl: joi.string().required(),
  grpcUrl: grpcUrlSchema.required(),
  verificationPath: joi
    .object({
      register: joi.string().required(),
      resetPassword: joi.string().required(),
    })
    .required(),
  redis: joi
    .object({
      host: joi.string().required(),
      port: joi.number().required(),
      password: joi.string().required().allow(''),
      database: joi.number().required(),
      prefix: joi.string().required(),
    })
    .required(),
  redisLock: joi
    .object({
      driftFactor: joi.number().required(),
      retryJitter: joi.number().required(),
      retryCount: joi.number().required(),
      retryDelay: joi.number().required(),
    })
    .required(),
  postgres: joi
    .object({
      host: joi.string().required(),
      port: joi.number().required(),
      username: joi.string().required(),
      password: joi.string().required(),
      database: joi.string().required(),
    })
    .required(),
  agenda: joi
    .object({
      uri: joi.string().required(),
      collection: joi.string().required(),
      database: joi.string().required(),
    })
    .required(),
  smtp: joi
    .object({
      host: joi.string().required(),
      port: joi.number().required(),
      secure: joi.boolean().required(),
      username: joi.string().required().allow(''),
      password: joi.string().required().allow(''),
      from: joi.string().required(),
    })
    .required(),
  verificationExpiresIn: joi
    .object({
      register: joi.number().required(),
      resetPassword: joi.number().required(),
    })
    .required(),
  jwt: joi
    .object({
      accessTokenExpiresIn: joi.number().required(),
      refreshTokenExpiresIn: joi.number().required(),
    })
    .required(),
  mongo: joi
    .object({
      uri: joi.string().required(),
      username: joi.string().required(),
      password: joi.string().required(),
      port: joi.number().required(),
      database: joi.string().required(),
    })
    .required(),
  kafka: joi
    .object({
      brokers: joi.array().items(joi.string()).required(),
      groupId: joi.string().required(),
      topics: joi
        .array()
        .items(
          joi.object({
            name: joi.string().required(),
            partitions: joi.number().integer().min(1).required(),
            replicationFactor: joi.number().integer().min(1).required(),
          }),
        )
        .required(),
    })
    .required(),
  aws: joi
    .object({
      accessKeyId: joi.string().required(),
      secretAccessKey: joi.string().required(),
      region: joi.string().required(),
      s3: joi
        .object({
          bucket: joi.string().required(),
          url: joi.string().required(),
        })
        .required(),
      ses: joi
        .object({
          from: joi.string().required(),
        })
        .required(),
    })
    .required(),
  services: servicesSchema.required(),
  stream: joi
    .object({
      api_key: joi.string().required(),
      secret_key: joi.string().required(),
    })
    .required(),
});

export const loadConfiguration = (): Configuration => {
  const config = load(readFileSync('config.yml', 'utf8')) as Record<
    string,
    any
  >;

  const { value, error } = configSchema.validate(config, { abortEarly: true });

  if (error) {
    throw new Error(error.message);
  }

  return value;
};
