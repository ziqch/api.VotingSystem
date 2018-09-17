const Router = require('koa-router');
const moment = require('moment');
const uuid = require('uuid/v1');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
let router = new Router();

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};
let logon_valid = {
  username: [{type:'required'},{type:'string'}],
  password: [{type:'required'},{type: 'string'}]
};

router.post('/login', async (ctx, next) => {
  validate(ctx.request.body, logon_valid, function (err) {
    if (err) ctx.throw(422, err);
  });
  return next();
}, async (ctx, next) => {
  let token = {};
  let user = {};
  let res = await DB.GET('users', 'username', ctx.request.body.username);
  if (res.length === 0) ctx.throw(401, '用户名或密码错误');
  else {
    let psw = crypto.createHash('sha256').update(ctx.request.body.password).digest('hex');
    if (res[0].password === psw) {
      user = res[0];
      token = {
        user_id: res[0].id,
        token: uuid(),
        ip: getClientIp(ctx.request),
        expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
      };
      await DB.INSERT('api_token', token);
      ctx.response.body = {user_id: user.id, access: user.access, token: token.token}
    } else {
      ctx.throw(401, '用户名或密码错误');
    }
  }
});

module.exports = router;