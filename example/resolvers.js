import db from './db-connection';

const users = async () => {
  const { data } = await db.select({
    table: 'Users',
  });
  return data;
};

const user = async ({ id }) => {
  const { data } = await db.select({
    table: 'Users',
    filters: `id = ${id}`,
    isArray: false,
  });
  return data;
};

const insertUser = async ({ records }) => {
  const response = await db.insert({
    table: 'Users',
    records,
  });
  return response;
};

const updateUser = async ({ updates }) => {
  const response = await db.update({
    table: 'Users',
    updates,
  });
  return response;
};

const deleteUser = async ({ ids }) => {
  const response = await db.delete({
    table: 'Users',
    ids,
  });
  return response;
};

const deleteInactiveUsers = async () => {
  const response = await db.delete({
    table: 'Users',
    filters: `status = 'inactive'`,
  });
  return response;
};

export {
  users,
  user,
  insertUser,
  updateUser,
  deleteUser,
  deleteInactiveUsers,
};
