import chalk from 'chalk'
export function logError(msg){
  console.log(chalk.red('X'));
  console.dir(msg);
}
export function logDebug(msg){
  console.log(msg);
}