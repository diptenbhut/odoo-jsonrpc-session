const OdooJsonrpc = require('./core');

const login = async (params) => {
  try {
    const odoo = new OdooJsonrpc({
      protocol: 'http',
      host: 'odoo-hostname', // odoo-server.com
      port: '80'
    });

    const clientRes = await odoo.connect({
      database: 'db-name',
      username: params.email,
      password: params.password
    });
    if (clientRes && clientRes.data && clientRes.data.error) {
      throw clientRes.data.error;
    } else {
      // extract and use session_id from session object for further request.
      return { 'message': 'Logged in', 'result': clientRes.data.result, 'session': clientRes.headers['set-cookie'] };
    }
  } catch (jsonErr) {
    if (jsonErr && jsonErr.data && jsonErr.data.name === 'odoo.exceptions.AccessDenied') {
      return 'Invalid login';
    } else {
      return 'Error';
    }
  }
};


/**
 * Get record from model
 * 
 * id = number
 * sessionId = Extract from login session 'session_id=blah' pass 'blah' as sessionId
 */
const getRecord = async (params) => {
  try {
    const query = [['field1', '=', params.field1], ['id', '=', params.id]];
    const odoo = new OdooJsonrpc({
      protocol: 'http',
      host: 'odoo-hostname', // odoo-server.com
      port: '80'
    });
    const odooInstance = await odoo.getAuthOdooClient({ database: process.env.Odoo_db }, params.sessionId);
    const record = await odooInstance.searchRead('model-name', query, {
      select: ['id', 'field1'], // add fields that needed in response
      offset: 0,
      limit: 1,
      order: 'id DESC'  // (optional)remove this key if not required
    });
    return record;
  } catch (jsonErr) {
    console.log('record err ', jsonErr);
    if (jsonErr && jsonErr.code === 404) {
      return 'Invalid login credentials';
    } else {
      return 'Error';
    }
  }
};

// Find other methods like searRead, count, read, create in core/lib/authClient.js