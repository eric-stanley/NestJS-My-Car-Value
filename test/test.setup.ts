import { Connection, getConnection } from 'typeorm';

global.afterEach(async () => {
  const conn = getConnection();
  await purgeEntities(conn);
  await conn.close();
});

const purgeEntities = async (conn: Connection) => {
  const entities = conn.entityMetadatas;

  for (const entity of entities) {
    const repository = getConnection().getRepository(entity.name); // Get repository
    await repository.delete({}); // Clear each entity table's content
  }
};
