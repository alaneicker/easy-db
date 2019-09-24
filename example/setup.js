import db from './db-connection';

(async () => {

  await db.createTable('Users', {
    name: 'string',
    email: 'string',
  });

  console.log('Table "Users" has been created');

})();