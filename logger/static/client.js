'use strict';

const protocol = 'http'; // ws,http
const API_ADDRESS = '127.0.0.1:8001';
let socket;

const transport = {
  ws: (name, method) => (...args) => new Promise((resolve) => {
    if (!socket) socket = new WebSocket(`ws://${API_ADDRESS}/`);
    const packet = { name, method, args };
    socket.send(JSON.stringify(packet));
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      resolve(data);
    };
  }),
  http: (name, method, service) => (...args) => {
    const params = service[method];
    const paramsReqExp = /(?<=\[)(?<urlParams>[^\]]+)(?=\])|(?<=\{)(?<bodyParams>[^\}]+)(?=\})/g;
    const paramMatch = [...params.matchAll(paramsReqExp)] || [];
    if (!paramMatch.length) throw new Error(`url,body params format is invalid: "${params}"`);
    const { urlParams, bodyParams } = paramMatch.reduce((acc, item) => {
      for (const [key, value] of Object.entries(item.groups)) {
        if (value && !(key in acc)) acc[key] = value;
      }
      return acc;
    }, {});
    const body = bodyParams ? args[Number(!!urlParams)] : null; // urlParams ? 1 : 0
    const urlPath = urlParams ? `/${args[0]}` : '';
    const reqUrl = `http://${API_ADDRESS}/${name}/${method}${urlPath}`;
    const reqParams = {
      method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      //   'Accept': 'application/json'
      // },
      ...(body && { body: JSON.stringify(body) })
    };
    return fetch(reqUrl, reqParams).then(res => res.json());
  }
};

const scaffold = (structure, transport) => {
  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);
    for (const method of methods) {
      api[serviceName][method] = transport(serviceName, method, service);
    }
  }
  return api;
};

const api_orig = scaffold({
  user: {
    create: ['record'],
    read: ['id'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
  country: {
    read: ['id'],
    delete: ['id'],
    find: ['mask'],
  }
}, transport[protocol]);
const api_obj = scaffold({
  user: {
    create: { body: 'record' },
    read: { params: ['id'] },
    update: { params: ['id'], body: 'record' },
    delete: { params: ['id'] },
    find: { params: ['mask'] }
  },
  country: {
    read: { params: ['id'] },
    delete: { params: ['id'] },
    find: { params: ['mask'] },
  }
}, transport[protocol]);
const api = scaffold({
  user: {
    create: '{record}',
    read: '[id]',
    update: '[id]{record}',
    delete: '[id]',
    find: '[mask]'
  },
  country: {
    read: '[id]',
    delete: '[id]',
    find:'[mask]'
  },
  city: {
    create: '{record}',
    read: '[id]',
    update: '[id]{record}',
    delete: '[id]',
  }
}, transport[protocol]);

// socket.addEventListener('open', async () => {
//   const data = await api.user.read(3);
//   console.dir({ data });
// });

(async () => {
  // const password = 'ypMEd9FwvtlOjcvH94iICQ==:V6LnSOVwXzENxeLCJk59Toadea7oaA1IxYulAOtKkL9tBxjEPOw085vYalEdLDoe8xbrXQlhh7QRGzrSe8Bthw=='
  // const data = await api.user.create({ login: 'user_00001', password });
  // const data = await api.user.read(53);
  // const data = await api.user.update(53, { login: 'user_53', password });
  // const data = await api.user.find('user_53');
  // const data = await api.user.delete(53);

  // const data = await api.country.read(1);
  // const data = await api.country.delete(8);
  // const data = await api.country.find('Cuba');

  const data = await api.city.create({ name: 'Lviv___8', country: 1 });
  // const data = await api.city.read(1);
  // const data = await api.city.update(7, { name: 'Lviv 222', country: 1 });
  // const data = await api.city.delete(9);

  console.log({ data });
})();

