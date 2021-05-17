module.exports = {
  server: {
    port: 8123,
  },
  database: {
    url: '127.0.0.1',
    port: 27017,
    database: 'link',
    collections: {
      data: 'data',
      disc: 'disc',
    },
  },
};
