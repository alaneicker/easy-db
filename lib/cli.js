import EasyDB from '.';
import inquirer from 'inquirer';
import boxen from 'boxen';
import chalk from 'chalk';

const db = new EasyDB();
db.connect();

const boxenOptions = {
  padding: 1,
  margin: 0,
  borderStyle: 'round',
  borderColor: 'yellow'
 };

const msgBox = boxen(
  chalk.bold.greenBright('SO, YOU WANT TO DROP A TABLE, EH?'),
  boxenOptions,
);

console.log(msgBox);

(async () => {
  try {
    const dbPromise = await db.dbPromise;
    const tables = await dbPromise.all(`
      SELECT name FROM sqlite_master
      WHERE type = 'table'
    `);

    const questions = {
      async selectTable() {
        const { table } = await inquirer.prompt([
          {
            type: 'list',
            name: 'table',
            message: 'Which table would you like to drop?',
            choices: [...tables.map(table => table.name)],
          }
        ])

        return table;
      },
      async confirmation(table) {
        const { confirmation } = await inquirer.prompt([
          {
            type: 'list',
            name: 'confirmation',
            message: `Are you sure you'd like to drop '${table}'?`,
            choices: ['Yes','No'],
          }
        ])
        
        return confirmation;
      },
    };

    const table = await questions.selectTable();
    const confirmation = await questions.confirmation(table);
    
    if (confirmation === 'Yes') {
      console.log(`Dropping table '${table}'...`);
      await dbPromise.run(`DROP TABLE ${table}`);
      console.log(chalk.greenBright(`Done. Table '${table}' has been dropped.`));
    } else {
      console.log(chalk.redBright('Drop cancelled.'));
    }
  } catch (err) {
    console.log(err);
  }
})();