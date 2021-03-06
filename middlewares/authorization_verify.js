/**
 * 在app.use(router)之前调用
 */
/**
 * Created Date: Tuesday, September 5th 2017, 9:38:29 pm
 * Author: liumin
 * 注：在添加路由之前调用
 */
import momont from 'moment';
import { User } from '../mongo/modals';
import { client } from '../utils/redis';

export default async (ctx, next) => {
  if (!ctx.url.match(/^\/oauth/)) {
    const { exp, data } = ctx.state.user;
    const now = momont().unix();
    if (now < exp) {
      let user = await client.getAsync(data);
      if (!user) {
        user = await User.findById(data);
        if (user) {
          console.log('The	user	does	not	exist	！');
          ctx.body = {
            status: 401,
            message: 'The	user	does	not	exist	！',
          };
        }
        await client.setAsync(user._id, user);
        console.log('Query and save');
      }
      ctx.user = user;
    } else {
      console.log('invalid');
    }
  }
  await next();
};

