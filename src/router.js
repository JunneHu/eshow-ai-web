/*
 * @Author: JunneyHu
 * @Date: 2025-05-28 15:53:39
 * @LastEditor: ${CURRENT_USER}
 * @LastEditTime: 2026-01-29 13:51:52
 * @FilePath: \big-data\big-data-admin\src\router.js
 */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, routerRedux, Redirect } from 'dva/router';
import { ConfigProvider } from 'antd';

const { ConnectedRouter } = routerRedux;
import zhCN from 'antd/es/locale/zh_CN';
import zhcn from 'moment/locale/zh-cn';
import moment from 'moment';
import 'antd/dist/reset.css';
import Page404 from '@/components/error/Page404';
import ToolsPage from '@/pages/Tools';
import CategoryDetail from '@/pages/Tools/CategoryDetail';
import ToolDetail from '@/pages/Tools/ToolDetail';
import NewsListPage from '@/pages/News';
import NewsDetailPage from '@/pages/News/Detail';

moment.defineLocale('zh-cn', zhcn);
moment.locale('zh-cn');

// C 端路由：不需要登录，直接展示 AI 工具集首页
const RouterWrapper = ({ history }) => {
  return (
    <ConnectedRouter history={history}>
      <ConfigProvider locale={zhCN}>
        <Switch>
          {/* 默认首页：AI 工具集 */}
          <Route exact path="/" component={ToolsPage} />

          {/* AI 资讯 */}
          <Route exact path="/news" component={NewsListPage} />
          <Route exact path="/news/:id" component={NewsDetailPage} />

          {/* 分类详情：展示该分类下所有工具 */}
          <Route exact path="/category/:id" component={CategoryDetail} />

          {/* 工具详情：工具介绍 + 推荐 */}
          <Route exact path="/tool/:id" component={ToolDetail} />

          {/* 兼容旧路径，全部重定向到首页 */}
          <Route
            exact
            path="/tools"
            render={() => <Redirect to="/" />}
          />

          {/* 兜底 404 页面 */}
          <Route component={Page404} />
        </Switch>
      </ConfigProvider>
    </ConnectedRouter>
  );
};

RouterWrapper.propTypes = {
  history: PropTypes.object,
};

RouterWrapper.defaultProps = {
  history: {},
};

export default RouterWrapper;

