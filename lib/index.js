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
      return { created: false, err }
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
   * Selects a record from a database table
   * @param  {String} arg1 database table name
   * @param  {Array}  arg2 Columns to be returned
   * @param  {Object} arg2 Filters for WHERE clause
   * @return {Object}      Result object containing query result. Contains error response if error was thrown
   */
  async select(tableName, tableColumns, filters) {
    try {
      const db = await this.dbPromise;
      const columns = tableColumns.join(', ');
      let whereClauseParams = null;

      if (filters) {
        whereClauseParams = Object.entries(filters).map(filter => {
          return `${filter[0]} = ${filter[1]}`;
        });
      }

      const result = await db.all(`
        SELECT ${columns} 
        FROM ${tableName}
        ${whereClauseParams ? `WHERE ${whereClauseParams}` : ''}
      `);

      return { data: result.length > 1 ? result : result[0] };
    } catch (err) {
      console.log(`Error: could not select from table ${tableName}`, err);
      return { data: null, err }
    }
  }

  /**
   * Inserts a record into a database table
   * @param  {String} arg1 database table name
   * @param  {Object} arg2 Object representing new record data
   * @return {Object}      Result object containing 'insertedIds' value. Contains error response if error was thrown
   */
  async insert(tableName, records) {
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
            INSERT INTO ${tableName} (${columns}) 
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
      return { lastID: null, err }
    }
  }

  /**
   * Updates a record in a database table
   * @param  {String} arg1 database table name
   * @param  {Object} arg2 Filters for WHERE clause
   * @param  {Object} arg2 Data to update
   * @return {Object}      Result object containing 'changes' value. Contains error response if error was thrown
   */
  async update(tableName, updates) {
    try  {
      const db = await this.dbPromise;

      updates = Array.isArray(updates) ? updates : [updates];

      const queryPromise = await Promise.all(
        updates.map(async (update) => {
          const { id, ...cols } = update;
          const values = Object.values(cols);
          const columns = Object.keys(cols).map(key => `${key} = ?`).join(', ');
  
          return await db.run(`
            UPDATE ${tableName}
            SET ${columns}
            WHERE id = ${id}
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
      return { changes: 0, err }
    }
  }

  /**
   * Deletes a record from a database table
   * @param  {String} arg1 database table name
   * @param  {Array} arg2 Array of ids
   * @return {Object} Result object containing 'deleted' value. Contains error response if error was thrown
   */
  async delete(tableName, ids) {
    try {
      const db = await this.dbPromise;

      ids = Array.isArray(ids) ? ids : [ids];

      const queryPromise = await Promise.all(
        ids.map(async (id) => {
          return await db.run(`
            DELETE FROM ${tableName} 
            WHERE id = ${id}
          `)
        })
      );

      const deleted = queryPromise.reduce((currentValue, next) => {
        return currentValue + next.changes;
      }, 0);

      console.log(`Record successfully deleted`);

      return { deleted };
    } catch (err) {
      console.log(`Error: Record could not be deleted`);
      return { deleted: 0, err };
    }
  }
}

export default EasyDB;