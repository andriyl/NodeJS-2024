module.exports = async ({ url, routing, notFoundFunc, receiveArgsFunc }) => {
  const args = [];
  const urlParams = url.substring(1).split('/');
  const [name, method, id] = urlParams;
  const entity = routing[name];
  if (!entity) return void notFoundFunc();

  const handler = entity[method];
  if (!handler) return void notFoundFunc();
  if (typeof handler !== 'function') throw new Error('Handler is not a function');

  const funcStr = handler.toString();
  const [_, matchParam] = funcStr.match(/\(([^)]*)\)/);
  if (matchParam && !matchParam.startsWith('{')) args.push(id);
  if (matchParam.includes('{')) args.push(await receiveArgsFunc());
  return args;
}
