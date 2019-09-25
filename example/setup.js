import db from './db-connection';

(async () => {
  try {
    await db.createTable('Users', {
      name: 'string',
      email: 'string',
      age: 'number',
      status: 'string',
    });
  
    await db.insert({
      table: 'Users',
      records: [
        {
          name: 'Alan Eicker',
          email: 'alaneicker@gmail.com',
          age: 44,
          status: 'active',
        },
        {
          name: 'Fred Smith',
          email: 'f.smith@gmail.com',
          age: 56,
          status: 'active',
        },
        {
          name: 'Paul Newman',
          email: 'p_newman@yahoo.com',
          age: 23,
          status: 'inactive',
        },
        {
          name: 'Ted Johnson',
          email: 'ted_johnson@gmail.com',
          age: 37,
          status: 'inactive',
        },
      ],
    });
  
    console.log('Table "Users" has been created');
  } catch (err) {
    console.log(err);
  }
})();
