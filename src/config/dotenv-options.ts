import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const connType = process.env.TYPEORM_CONNECTION || 'mysql';
const p = path.join(process.cwd(), `env/${connType}/.${env}.env`);
console.log(`Loading environment from ${p}`);
const dotEnvOptions = {
  path: p,
};

export { dotEnvOptions };
