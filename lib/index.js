import sqlite from 'sqlite';

/**
 * Converts JavaScript types to SQL data types
 * @param  {String} arg1 data type
 * @return {Object}      returns a string representing a SQL data type
 */
const getDataType = (type) => {
  switch(type) {
    case '':
      return 'NULL';
    case 'string':
      return 'VARCHAR';
    case 'number':
      return 'INTEGER';
    case 'float':
      return 'REAL';
    case 'blob':
      return 'BLOB';
    default:
      return'VARCHAR';
  }
};

class EasyDB {
  constructor() {
    this.dbPromise = null;
  }

  /**
   * Connects to a database table
   * @return Void
   */
  connect() {
    this.dbPromise = sqlite.open(`${process.cwd()}/database.sqlite`);
    console.log('Connected to database');
  }

  /**
   * Creates a database table
   * @param  {String} arg1 database table name
   * @param  {Object} arg2 Object representing table columns and data types
   * @return {Object}      Result object. Contains error response if error was thrown
   */
  async createTable(tableName, tableColumns) {
    try {
      const db = await this.dbPromise;
      let columns = `id INTEGER PRIMARY KEY, `;

      for (let [index, [key, value]] of Object.entries(Object.entries(tableColumns))) {
        const delimiter = +index + 1 !== Object.keys(tableColumns).length ? ', ' : '';
        columns += `${key} ${getDataType(value)}${delimiter}`;
      }
      
      await db.run(`CREATE TABLE ${tableName} (${columns})`);
          
      return { created: true }
    } catch (err) {
      console.log(`Error: Database table ${tableName} could not be created`, err);
      return { err };
    }
  }

  async combineAllTables() {
    const db = await this.dbPromise;

    const result = await db.all(`
      SELECT name FROM sqlite_master
      WHERE type = 'table'
    `);

    const tables = result.map(table => table.name);

    const combinedData = {};

    for (const table of tables) {
      combinedData[table] = await db.all(`SELECT * FROM ${table}`);
    }

    return combinedData;
  }

  /**
   * Selects one or more records from a database table
   * @param  {String} arg1 database table name
   * @param  {Array}  arg2 Columns to be returned
   * @param  {Object} arg2 Filters for WHERE clause
   * @return {Object}      Result object containing query result array. Contains error response if error was thrown
   */
  async select({ table, columns = '*', filters, isArray = true }) {
    try {
      const db = await this.dbPromise;
      let whereClauseParams = '';

      if (filters) {
        whereClauseParams = `WHERE ${filters.split(',').join(' AND ')}`;
      }

      const data = await db[isArray ? 'all' : 'get'](`
        SELECT ${columns} 
        FROM ${table}
        ${whereClauseParams}
      `);

      return { data };
    } catch (err) {
      console.log(`Error: could not select from table ${table}`, err);
      return { err };
    }
  }

  /**
   * Inserts a record into a database table
   * @param  {String} arg1 database table name
   * @param  {Object} arg2 Object representing new record data
   * @return {Object}      Result object containing 'insertedIds' value. Contains error response if error was thrown
   */
  async insert({ table, records }) {
    try {
      const db = await this.dbPromise;
      const insertedIds = [];
      records = Array.isArray(records) ? records : [records];
      
      const queryPromise = await Promise.all(
        records.map(async (record) => {
          record = { id: (Math.floor(Math.random() * 90000) + 10000), ...record };
 
          const values = Object.values(record);
          const columns = Object.keys(record).join(',');
          const valuePlaceholders = Array(values.length).fill('?').join(',');
  
          return await db.run(`
            INSERT INTO ${table} (${columns}) 
            VALUES (${valuePlaceholders})`, 
            values
          );
        })
      );

      queryPromise.forEach(result => insertedIds.push(result.lastID));

      console.log(`Record created successfully`);

      return { insertedIds };
    } catch (err) {
      console.log('Error: New record could not be created', err);
      return { err };
    }
  }

  /**
   * Updates a one or more records in a database table based on IDs
   * @param  {String} arg1 database table name
   * @param  {Object} arg2 Data to update
   * @return {Object}      Result object containing 'changes' value. Contains error response if error was thrown
   */
  async update({ table, updates, filters }) {
    try  {
      const db = await this.dbPromise;
      let whereClauseParams = '';

      if (filters) {
        whereClauseParams = `WHERE ${filters.split(',').join(' AND ')}`;
      }
      
      updates = Array.isArray(updates) ? updates : [updates];

      const queryPromise = await Promise.all(
        updates.map(async (update) => {
          const { id, ...cols } = update;
          const values = Object.values(cols);
          const columns = Object.keys(cols).map(key => `${key} = ?`).join(', ');
          
          if (id) {
            whereClauseParams = `WHERE id = ${id}`;
          }

          return await db.run(`
            UPDATE ${table}
            SET ${columns}
            ${whereClauseParams}
          `, values);
        })
      );

      const changes = queryPromise.reduce((currentValue, next) => {
        return currentValue + next.changes;
      }, 0);
   
      console.log(`Record updated successfully`);

      return { changes };
    } catch (err) {
      console.log('Error: Record could not be updated', err);
      return { err };
    }
  }

  /**
   * Deletes a one or more records from a table based on IDs
   * @param  {String} arg1 database table name
   * @param  {Array} arg2 Array of ids
   * @return {Object} Result object containing 'deleted' value. Contains error response if error was thrown
   */
  async delete({ table, ids, filters }) {
    try {
      const db = await this.dbPromise;
      let deleted;

      if (ids) {
        ids = Array.isArray(ids) ? ids : [ids];
        console.log('has ids');
        const result = await Promise.all(
          ids.map(async (id) => {
            return await db.run(`
              DELETE FROM ${table} 
              WHERE id = ${id}
            `)
          })
        );

        deleted = result.reduce((currentValue, next) => {
          return currentValue + next.changes;
        }, 0);
      }

      if (filters) {
        const { changes } = await db.run(`
          DELETE FROM ${table} 
          WHERE ${filters.split(',').join(' AND ')}
        `);

        deleted = changes;
      }

      console.log(`Record successfully deleted`);

      return { deleted };
    } catch (err) {
      console.log(`Error: Record could not be deleted`, err);
      return { err };
    }
  }
}

export default EasyDB;
