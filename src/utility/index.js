import chalk from 'chalk'
export function logError(msg){
  console.log(chalk.bold.red(msg));
}