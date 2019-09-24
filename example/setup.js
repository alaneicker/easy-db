import db from './db-connection';

(async () => {
  try {
    await db.createTable('Users', {
      name: 'string',
      email: 'string',
    });
  
    await db.insert('Users', [
      {
        name: 'Alan Eicker',
        email: 'alaneicker@gmail.com',
      },
      {
        name: 'Fred Smith',
        email: 'f.smith@gmail.com',
      },
      {
        name: 'Paul Newman',
        email: 'p_newman@yahoo.com',
      },
      {
        name: 'Ted Johnson',
        email: 'ted_johnson@gmail.com',
      },
    ]);
  
    console.log('Table "Users" has been created');
  } catch (err) {
    console.log(err);
  }
})();