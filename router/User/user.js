const Router = require('koa-router');
const CheckLogined = require('../../middleware/CheckLogined');
const DB = require('../../libs/DB_Service');

let router = new Router();


router.get('/:username', CheckLogined, async function (ctx, next) {
  if (!ctx.params.username) ctx.throw(422, {inputError: {username: ['username is required']}});
  let username = ctx.params.username;
  let res = await DB.SERACH('users', "LIKE '%"+ username +"%'", 'username');
  res = res.map(o => ({
    id: o.id,
    username: o.username
  }));
  ctx.response.body = res;
});

module.exports = router;

