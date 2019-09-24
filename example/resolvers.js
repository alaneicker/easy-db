import db from './db-connection';

const megastate = async () => {
  const megastate = await db.combineAllTables();
  return megastate;
}

const users = async () => {
  const { data } = await db.select('Users', ['*']);
  return Array.isArray(data) ? data : [data];
};

const user = async ({ id }) => {
  const { data } = await db.select('Users', ['*'], { id });
  return data;
};

const insertUser = async ({ body }) => {
  const response = await db.insert('Users', body);
  return response;
};

const updateUser = async ({ body }) => {
  const response = await db.update('Users', body);
  return response;
};

const deleteUser = async ({ ids }) => {
  const response = await db.delete('Users', ids);
  return response;
};

export {
  users,
  user,
  insertUser,
  updateUser,
  deleteUser,
  megastate,
};