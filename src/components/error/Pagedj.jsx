import React, { Component } from 'react';
import { Button } from 'antd';
import service from '../utils/service';

import "./base.less";

class PageDj extends Component {
    loginOut = () => {
        service.loginOut();
    }

    render() {
        return (
            <div className="ex_container" style={{ textAlign: 'center' }}>
                <div className="spirit_dj"></div>
                <b style={{ display: 'block', marginTop: 20 }}>{this.props.msg ? this.props.msg : '该账号被冻结'}</b>
                <div style={{ marginTop: 15 }}>
                    <Button type="primary" onClick={this.loginOut}>返回登录页面</Button>
                </div>
            </div>
        );
    }
}

export default PageDj;