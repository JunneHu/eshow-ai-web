// import "babel/polyfill";
import dva from 'dva';
import createLoading from 'dva-loading';
import { createBrowserHistory } from 'history';
import message from 'antd/lib/message';
import Router from './router';
import './assets/css/antdCommon.less';
import './assets/css/common.less';
import './assets/css/color.css';
import './assets/css/tailwindcss.css'

const app = dva({
  history: createBrowserHistory(),
  onError(e) {
    message.error(e.message, 3);
  },
});

app.use(createLoading());

app.router(Router);

app.start('#app');
