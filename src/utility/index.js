import chalk from 'chalk'
export function logError(msg){
  console.log(chalk.bold.red(arguments.callee.caller + ": " + msg));
}
export function logDebug(msg){
  console.log(msg);
}