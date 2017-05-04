import chalk from 'chalk'
export function logError(msg){
  console.log(chalk.bold.red(msg));
}
export function logDebug(msg){
  console.log(msg);
}